-- ========================================
-- FAMILY TRAVEL TRACKER - UNIFIED SUPABASE SCHEMA
-- ========================================
-- This file contains everything needed to set up your Supabase database
-- Run this entire file in your Supabase SQL Editor
-- Created: June 2025

-- ========================================
-- 1. DROP EXISTING OBJECTS (Clean slate)
-- ========================================
DROP TABLE IF EXISTS visited_countries CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS generate_unique_username(text) CASCADE;
DROP FUNCTION IF EXISTS update_user_profile_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_countries_by_region(UUID) CASCADE;
DROP FUNCTION IF EXISTS exec_sql(text) CASCADE;
DROP FUNCTION IF EXISTS create_user_profiles_table() CASCADE;

-- ========================================
-- 2. CREATE EXEC SQL FUNCTION (For client operations)
-- ========================================
-- This function allows SQL execution from client (service role only)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Set RLS policy for the function (service role only)
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- ========================================
-- 3. CREATE COUNTRIES TABLE
-- ========================================
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) UNIQUE NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    flag_url VARCHAR(500),
    population BIGINT,
    capital VARCHAR(100),
    region VARCHAR(100),
    subregion VARCHAR(100)
);

-- ========================================
-- 4. CREATE USER PROFILES TABLE
-- ========================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- ========================================
-- 5. CREATE VISITED COUNTRIES TABLE
-- ========================================
CREATE TABLE visited_countries (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country_id)
);

-- Create indexes for better performance
CREATE INDEX idx_visited_countries_user_id ON visited_countries(user_id);
CREATE INDEX idx_visited_countries_country_id ON visited_countries(country_id);

-- ========================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visited_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. CREATE SECURITY POLICIES
-- ========================================

-- Countries: Anyone can read
CREATE POLICY "Anyone can view countries" ON countries
    FOR SELECT USING (true);

-- Visited Countries: Users can only access their own data
CREATE POLICY "Users can manage their own visited countries" ON visited_countries
    FOR ALL USING (auth.uid() = user_id);

-- User Profiles: Users can only manage their own profile
CREATE POLICY "Users can manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- User Profiles: Anyone can read profiles (for displaying usernames in family context)
CREATE POLICY "Anyone can view user profiles" ON user_profiles
    FOR SELECT USING (true);

-- ========================================
-- 8. CREATE HELPER FUNCTION FOR UNIQUE USERNAMES
-- ========================================
CREATE OR REPLACE FUNCTION generate_unique_username(base_username text)
RETURNS text AS $$
DECLARE
    new_username text;
    counter integer := 1;
BEGIN
    -- Start with the base username
    new_username := base_username;
    
    -- Check if it exists, if so, add numbers until we find a unique one
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = new_username) LOOP
        new_username := base_username || counter::text;
        counter := counter + 1;
    END LOOP;
    
    RETURN new_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. CREATE FUNCTION TO HANDLE USER REGISTRATION
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username text;
    final_username text;
    user_full_name text;
    user_avatar_color text;
BEGIN
    -- Extract metadata from the new user
    base_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    user_avatar_color := COALESCE(
        NEW.raw_user_meta_data->>'avatar_color',
        '#3B82F6'
    );
    
    -- Generate unique username
    final_username := generate_unique_username(base_username);
    
    -- Insert user profile
    INSERT INTO user_profiles (id, username, full_name, avatar_color)
    VALUES (NEW.id, final_username, user_full_name, user_avatar_color);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 10. CREATE FUNCTION TO UPDATE USER PROFILE TIMESTAMPS
-- ========================================
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_user_profile_updated_at();

-- ========================================
-- 11. CREATE USER PROFILES TABLE FUNCTION (Backup)
-- ========================================
CREATE OR REPLACE FUNCTION create_user_profiles_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    RETURN TRUE;
  END IF;

  -- This function is now redundant since we create the table above,
  -- but keeping it for compatibility with existing code
  RETURN TRUE;
END;
$$;

-- ========================================
-- 12. CREATE ADDITIONAL USEFUL FUNCTIONS
-- ========================================

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
    total_countries INTEGER,
    visited_countries INTEGER,
    percentage NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM countries) as total_countries,
        (SELECT COUNT(*)::INTEGER FROM visited_countries WHERE user_id = user_uuid) as visited_countries,
        ROUND(
            (SELECT COUNT(*)::NUMERIC FROM visited_countries WHERE user_id = user_uuid) * 100.0 / 
            NULLIF((SELECT COUNT(*) FROM countries), 0),
            2
        ) as percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get countries by region for a user
CREATE OR REPLACE FUNCTION get_user_countries_by_region(user_uuid UUID)
RETURNS TABLE(
    region TEXT,
    total_in_region INTEGER,
    visited_in_region INTEGER,
    countries_visited TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.region::TEXT,
        COUNT(*)::INTEGER as total_in_region,
        COUNT(vc.id)::INTEGER as visited_in_region,
        ARRAY_AGG(c.country_name ORDER BY c.country_name) FILTER (WHERE vc.id IS NOT NULL) as countries_visited
    FROM countries c
    LEFT JOIN visited_countries vc ON c.id = vc.country_id AND vc.user_id = user_uuid
    GROUP BY c.region
    ORDER BY c.region;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 13. INSERT ALL WORLD COUNTRIES (195 countries)
-- ========================================
INSERT INTO countries (country_code, country_name, flag_url, population, capital, region, subregion) VALUES 
('AF', 'Afghanistan', 'https://flagcdn.com/w320/af.png', 38928346, 'Kabul', 'Asia', 'Southern Asia'),
('AL', 'Albania', 'https://flagcdn.com/w320/al.png', 2877797, 'Tirana', 'Europe', 'Southern Europe'),
('DZ', 'Algeria', 'https://flagcdn.com/w320/dz.png', 43851044, 'Algiers', 'Africa', 'Northern Africa'),
('AD', 'Andorra', 'https://flagcdn.com/w320/ad.png', 77265, 'Andorra la Vella', 'Europe', 'Southern Europe'),
('AO', 'Angola', 'https://flagcdn.com/w320/ao.png', 32866272, 'Luanda', 'Africa', 'Middle Africa'),
('AR', 'Argentina', 'https://flagcdn.com/w320/ar.png', 45195774, 'Buenos Aires', 'Americas', 'South America'),
('AM', 'Armenia', 'https://flagcdn.com/w320/am.png', 2963243, 'Yerevan', 'Asia', 'Western Asia'),
('AU', 'Australia', 'https://flagcdn.com/w320/au.png', 25499884, 'Canberra', 'Oceania', 'Australia and New Zealand'),
('AT', 'Austria', 'https://flagcdn.com/w320/at.png', 9006398, 'Vienna', 'Europe', 'Western Europe'),
('AZ', 'Azerbaijan', 'https://flagcdn.com/w320/az.png', 10139177, 'Baku', 'Asia', 'Western Asia'),
('BS', 'Bahamas', 'https://flagcdn.com/w320/bs.png', 393244, 'Nassau', 'Americas', 'Caribbean'),
('BH', 'Bahrain', 'https://flagcdn.com/w320/bh.png', 1701575, 'Manama', 'Asia', 'Western Asia'),
('BD', 'Bangladesh', 'https://flagcdn.com/w320/bd.png', 164689383, 'Dhaka', 'Asia', 'Southern Asia'),
('BB', 'Barbados', 'https://flagcdn.com/w320/bb.png', 287375, 'Bridgetown', 'Americas', 'Caribbean'),
('BY', 'Belarus', 'https://flagcdn.com/w320/by.png', 9449323, 'Minsk', 'Europe', 'Eastern Europe'),
('BE', 'Belgium', 'https://flagcdn.com/w320/be.png', 11589623, 'Brussels', 'Europe', 'Western Europe'),
('BZ', 'Belize', 'https://flagcdn.com/w320/bz.png', 397628, 'Belmopan', 'Americas', 'Central America'),
('BJ', 'Benin', 'https://flagcdn.com/w320/bj.png', 12123200, 'Porto-Novo', 'Africa', 'Western Africa'),
('BT', 'Bhutan', 'https://flagcdn.com/w320/bt.png', 771608, 'Thimphu', 'Asia', 'Southern Asia'),
('BO', 'Bolivia', 'https://flagcdn.com/w320/bo.png', 11673021, 'Sucre', 'Americas', 'South America'),
('BA', 'Bosnia and Herzegovina', 'https://flagcdn.com/w320/ba.png', 3280819, 'Sarajevo', 'Europe', 'Southern Europe'),
('BW', 'Botswana', 'https://flagcdn.com/w320/bw.png', 2351627, 'Gaborone', 'Africa', 'Southern Africa'),
('BR', 'Brazil', 'https://flagcdn.com/w320/br.png', 212559417, 'Brasília', 'Americas', 'South America'),
('BN', 'Brunei', 'https://flagcdn.com/w320/bn.png', 437479, 'Bandar Seri Begawan', 'Asia', 'South-Eastern Asia'),
('BG', 'Bulgaria', 'https://flagcdn.com/w320/bg.png', 6948445, 'Sofia', 'Europe', 'Eastern Europe'),
('BF', 'Burkina Faso', 'https://flagcdn.com/w320/bf.png', 20903273, 'Ouagadougou', 'Africa', 'Western Africa'),
('BI', 'Burundi', 'https://flagcdn.com/w320/bi.png', 11890784, 'Gitega', 'Africa', 'Eastern Africa'),
('CV', 'Cabo Verde', 'https://flagcdn.com/w320/cv.png', 555987, 'Praia', 'Africa', 'Western Africa'),
('KH', 'Cambodia', 'https://flagcdn.com/w320/kh.png', 16718965, 'Phnom Penh', 'Asia', 'South-Eastern Asia'),
('CM', 'Cameroon', 'https://flagcdn.com/w320/cm.png', 26545863, 'Yaoundé', 'Africa', 'Middle Africa'),
('CA', 'Canada', 'https://flagcdn.com/w320/ca.png', 37742154, 'Ottawa', 'Americas', 'Northern America'),
('CF', 'Central African Republic', 'https://flagcdn.com/w320/cf.png', 4829767, 'Bangui', 'Africa', 'Middle Africa'),
('TD', 'Chad', 'https://flagcdn.com/w320/td.png', 16425864, 'N''Djamena', 'Africa', 'Middle Africa'),
('CL', 'Chile', 'https://flagcdn.com/w320/cl.png', 19116201, 'Santiago', 'Americas', 'South America'),
('CN', 'China', 'https://flagcdn.com/w320/cn.png', 1439323776, 'Beijing', 'Asia', 'Eastern Asia'),
('CO', 'Colombia', 'https://flagcdn.com/w320/co.png', 50882891, 'Bogotá', 'Americas', 'South America'),
('KM', 'Comoros', 'https://flagcdn.com/w320/km.png', 869601, 'Moroni', 'Africa', 'Eastern Africa'),
('CG', 'Congo', 'https://flagcdn.com/w320/cg.png', 5518087, 'Brazzaville', 'Africa', 'Middle Africa'),
('CD', 'Congo (Democratic Republic)', 'https://flagcdn.com/w320/cd.png', 89561403, 'Kinshasa', 'Africa', 'Middle Africa'),
('CR', 'Costa Rica', 'https://flagcdn.com/w320/cr.png', 5094118, 'San José', 'Americas', 'Central America'),
('CI', 'Côte d''Ivoire', 'https://flagcdn.com/w320/ci.png', 26378274, 'Yamoussoukro', 'Africa', 'Western Africa'),
('HR', 'Croatia', 'https://flagcdn.com/w320/hr.png', 4105267, 'Zagreb', 'Europe', 'Southern Europe'),
('CU', 'Cuba', 'https://flagcdn.com/w320/cu.png', 11326616, 'Havana', 'Americas', 'Caribbean'),
('CY', 'Cyprus', 'https://flagcdn.com/w320/cy.png', 1207359, 'Nicosia', 'Europe', 'Southern Europe'),
('CZ', 'Czech Republic', 'https://flagcdn.com/w320/cz.png', 10708981, 'Prague', 'Europe', 'Eastern Europe'),
('DK', 'Denmark', 'https://flagcdn.com/w320/dk.png', 5792202, 'Copenhagen', 'Europe', 'Northern Europe'),
('DJ', 'Djibouti', 'https://flagcdn.com/w320/dj.png', 988000, 'Djibouti', 'Africa', 'Eastern Africa'),
('DM', 'Dominica', 'https://flagcdn.com/w320/dm.png', 71986, 'Roseau', 'Americas', 'Caribbean'),
('DO', 'Dominican Republic', 'https://flagcdn.com/w320/do.png', 10847910, 'Santo Domingo', 'Americas', 'Caribbean'),
('EC', 'Ecuador', 'https://flagcdn.com/w320/ec.png', 17643054, 'Quito', 'Americas', 'South America'),
('EG', 'Egypt', 'https://flagcdn.com/w320/eg.png', 102334404, 'Cairo', 'Africa', 'Northern Africa'),
('SV', 'El Salvador', 'https://flagcdn.com/w320/sv.png', 6486205, 'San Salvador', 'Americas', 'Central America'),
('GQ', 'Equatorial Guinea', 'https://flagcdn.com/w320/gq.png', 1402985, 'Malabo', 'Africa', 'Middle Africa'),
('ER', 'Eritrea', 'https://flagcdn.com/w320/er.png', 3546421, 'Asmara', 'Africa', 'Eastern Africa'),
('EE', 'Estonia', 'https://flagcdn.com/w320/ee.png', 1326535, 'Tallinn', 'Europe', 'Northern Europe'),
('SZ', 'Eswatini', 'https://flagcdn.com/w320/sz.png', 1160164, 'Mbabane', 'Africa', 'Southern Africa'),
('ET', 'Ethiopia', 'https://flagcdn.com/w320/et.png', 114963588, 'Addis Ababa', 'Africa', 'Eastern Africa'),
('FJ', 'Fiji', 'https://flagcdn.com/w320/fj.png', 896445, 'Suva', 'Oceania', 'Melanesia'),
('FI', 'Finland', 'https://flagcdn.com/w320/fi.png', 5540720, 'Helsinki', 'Europe', 'Northern Europe'),
('FR', 'France', 'https://flagcdn.com/w320/fr.png', 65273511, 'Paris', 'Europe', 'Western Europe'),
('GA', 'Gabon', 'https://flagcdn.com/w320/ga.png', 2225734, 'Libreville', 'Africa', 'Middle Africa'),
('GM', 'Gambia', 'https://flagcdn.com/w320/gm.png', 2416668, 'Banjul', 'Africa', 'Western Africa'),
('GE', 'Georgia', 'https://flagcdn.com/w320/ge.png', 3989167, 'Tbilisi', 'Asia', 'Western Asia'),
('DE', 'Germany', 'https://flagcdn.com/w320/de.png', 83783942, 'Berlin', 'Europe', 'Western Europe'),
('GH', 'Ghana', 'https://flagcdn.com/w320/gh.png', 31072940, 'Accra', 'Africa', 'Western Africa'),
('GR', 'Greece', 'https://flagcdn.com/w320/gr.png', 10423054, 'Athens', 'Europe', 'Southern Europe'),
('GD', 'Grenada', 'https://flagcdn.com/w320/gd.png', 112523, 'St. George''s', 'Americas', 'Caribbean'),
('GT', 'Guatemala', 'https://flagcdn.com/w320/gt.png', 17915568, 'Guatemala City', 'Americas', 'Central America'),
('GN', 'Guinea', 'https://flagcdn.com/w320/gn.png', 13132795, 'Conakry', 'Africa', 'Western Africa'),
('GW', 'Guinea-Bissau', 'https://flagcdn.com/w320/gw.png', 1968001, 'Bissau', 'Africa', 'Western Africa'),
('GY', 'Guyana', 'https://flagcdn.com/w320/gy.png', 786552, 'Georgetown', 'Americas', 'South America'),
('HT', 'Haiti', 'https://flagcdn.com/w320/ht.png', 11402528, 'Port-au-Prince', 'Americas', 'Caribbean'),
('HN', 'Honduras', 'https://flagcdn.com/w320/hn.png', 9904607, 'Tegucigalpa', 'Americas', 'Central America'),
('HU', 'Hungary', 'https://flagcdn.com/w320/hu.png', 9660351, 'Budapest', 'Europe', 'Eastern Europe'),
('IS', 'Iceland', 'https://flagcdn.com/w320/is.png', 341243, 'Reykjavík', 'Europe', 'Northern Europe'),
('IN', 'India', 'https://flagcdn.com/w320/in.png', 1380004385, 'New Delhi', 'Asia', 'Southern Asia'),
('ID', 'Indonesia', 'https://flagcdn.com/w320/id.png', 273523615, 'Jakarta', 'Asia', 'South-Eastern Asia'),
('IR', 'Iran', 'https://flagcdn.com/w320/ir.png', 83992949, 'Tehran', 'Asia', 'Southern Asia'),
('IQ', 'Iraq', 'https://flagcdn.com/w320/iq.png', 40222493, 'Baghdad', 'Asia', 'Western Asia'),
('IE', 'Ireland', 'https://flagcdn.com/w320/ie.png', 4937786, 'Dublin', 'Europe', 'Northern Europe'),
('IL', 'Israel', 'https://flagcdn.com/w320/il.png', 8655535, 'Jerusalem', 'Asia', 'Western Asia'),
('IT', 'Italy', 'https://flagcdn.com/w320/it.png', 60461826, 'Rome', 'Europe', 'Southern Europe'),
('JM', 'Jamaica', 'https://flagcdn.com/w320/jm.png', 2961167, 'Kingston', 'Americas', 'Caribbean'),
('JP', 'Japan', 'https://flagcdn.com/w320/jp.png', 126476461, 'Tokyo', 'Asia', 'Eastern Asia'),
('JO', 'Jordan', 'https://flagcdn.com/w320/jo.png', 10203134, 'Amman', 'Asia', 'Western Asia'),
('KZ', 'Kazakhstan', 'https://flagcdn.com/w320/kz.png', 18776707, 'Nur-Sultan', 'Asia', 'Central Asia'),
('KE', 'Kenya', 'https://flagcdn.com/w320/ke.png', 53771296, 'Nairobi', 'Africa', 'Eastern Africa'),
('KI', 'Kiribati', 'https://flagcdn.com/w320/ki.png', 119449, 'Tarawa', 'Oceania', 'Micronesia'),
('KP', 'North Korea', 'https://flagcdn.com/w320/kp.png', 25778816, 'Pyongyang', 'Asia', 'Eastern Asia'),
('KR', 'South Korea', 'https://flagcdn.com/w320/kr.png', 51269185, 'Seoul', 'Asia', 'Eastern Asia'),
('KW', 'Kuwait', 'https://flagcdn.com/w320/kw.png', 4270571, 'Kuwait City', 'Asia', 'Western Asia'),
('KG', 'Kyrgyzstan', 'https://flagcdn.com/w320/kg.png', 6524195, 'Bishkek', 'Asia', 'Central Asia'),
('LA', 'Laos', 'https://flagcdn.com/w320/la.png', 7275560, 'Vientiane', 'Asia', 'South-Eastern Asia'),
('LV', 'Latvia', 'https://flagcdn.com/w320/lv.png', 1886198, 'Riga', 'Europe', 'Northern Europe'),
('LB', 'Lebanon', 'https://flagcdn.com/w320/lb.png', 6825445, 'Beirut', 'Asia', 'Western Asia'),
('LS', 'Lesotho', 'https://flagcdn.com/w320/ls.png', 2142249, 'Maseru', 'Africa', 'Southern Africa'),
('LR', 'Liberia', 'https://flagcdn.com/w320/lr.png', 5057681, 'Monrovia', 'Africa', 'Western Africa'),
('LY', 'Libya', 'https://flagcdn.com/w320/ly.png', 6871292, 'Tripoli', 'Africa', 'Northern Africa'),
('LI', 'Liechtenstein', 'https://flagcdn.com/w320/li.png', 38128, 'Vaduz', 'Europe', 'Western Europe'),
('LT', 'Lithuania', 'https://flagcdn.com/w320/lt.png', 2722289, 'Vilnius', 'Europe', 'Northern Europe'),
('LU', 'Luxembourg', 'https://flagcdn.com/w320/lu.png', 625978, 'Luxembourg', 'Europe', 'Western Europe'),
('MG', 'Madagascar', 'https://flagcdn.com/w320/mg.png', 27691018, 'Antananarivo', 'Africa', 'Eastern Africa'),
('MW', 'Malawi', 'https://flagcdn.com/w320/mw.png', 19129952, 'Lilongwe', 'Africa', 'Eastern Africa'),
('MY', 'Malaysia', 'https://flagcdn.com/w320/my.png', 32365999, 'Kuala Lumpur', 'Asia', 'South-Eastern Asia'),
('MV', 'Maldives', 'https://flagcdn.com/w320/mv.png', 540544, 'Malé', 'Asia', 'Southern Asia'),
('ML', 'Mali', 'https://flagcdn.com/w320/ml.png', 20250833, 'Bamako', 'Africa', 'Western Africa'),
('MT', 'Malta', 'https://flagcdn.com/w320/mt.png', 441543, 'Valletta', 'Europe', 'Southern Europe'),
('MH', 'Marshall Islands', 'https://flagcdn.com/w320/mh.png', 59190, 'Majuro', 'Oceania', 'Micronesia'),
('MR', 'Mauritania', 'https://flagcdn.com/w320/mr.png', 4649658, 'Nouakchott', 'Africa', 'Western Africa'),
('MU', 'Mauritius', 'https://flagcdn.com/w320/mu.png', 1271768, 'Port Louis', 'Africa', 'Eastern Africa'),
('MX', 'Mexico', 'https://flagcdn.com/w320/mx.png', 128932753, 'Mexico City', 'Americas', 'Central America'),
('FM', 'Micronesia', 'https://flagcdn.com/w320/fm.png', 115023, 'Palikir', 'Oceania', 'Micronesia'),
('MD', 'Moldova', 'https://flagcdn.com/w320/md.png', 4033963, 'Chișinău', 'Europe', 'Eastern Europe'),
('MC', 'Monaco', 'https://flagcdn.com/w320/mc.png', 39242, 'Monaco', 'Europe', 'Western Europe'),
('MN', 'Mongolia', 'https://flagcdn.com/w320/mn.png', 3278290, 'Ulaanbaatar', 'Asia', 'Eastern Asia'),
('ME', 'Montenegro', 'https://flagcdn.com/w320/me.png', 628066, 'Podgorica', 'Europe', 'Southern Europe'),
('MA', 'Morocco', 'https://flagcdn.com/w320/ma.png', 36910560, 'Rabat', 'Africa', 'Northern Africa'),
('MZ', 'Mozambique', 'https://flagcdn.com/w320/mz.png', 31255435, 'Maputo', 'Africa', 'Eastern Africa'),
('MM', 'Myanmar', 'https://flagcdn.com/w320/mm.png', 54409800, 'Naypyidaw', 'Asia', 'South-Eastern Asia'),
('NA', 'Namibia', 'https://flagcdn.com/w320/na.png', 2540905, 'Windhoek', 'Africa', 'Southern Africa'),
('NR', 'Nauru', 'https://flagcdn.com/w320/nr.png', 10824, 'Yaren', 'Oceania', 'Micronesia'),
('NP', 'Nepal', 'https://flagcdn.com/w320/np.png', 29136808, 'Kathmandu', 'Asia', 'Southern Asia'),
('NL', 'Netherlands', 'https://flagcdn.com/w320/nl.png', 17134872, 'Amsterdam', 'Europe', 'Western Europe'),
('NZ', 'New Zealand', 'https://flagcdn.com/w320/nz.png', 4822233, 'Wellington', 'Oceania', 'Australia and New Zealand'),
('NI', 'Nicaragua', 'https://flagcdn.com/w320/ni.png', 6624554, 'Managua', 'Americas', 'Central America'),
('NE', 'Niger', 'https://flagcdn.com/w320/ne.png', 24206644, 'Niamey', 'Africa', 'Western Africa'),
('NG', 'Nigeria', 'https://flagcdn.com/w320/ng.png', 206139589, 'Abuja', 'Africa', 'Western Africa'),
('MK', 'North Macedonia', 'https://flagcdn.com/w320/mk.png', 2083374, 'Skopje', 'Europe', 'Southern Europe'),
('NO', 'Norway', 'https://flagcdn.com/w320/no.png', 5421241, 'Oslo', 'Europe', 'Northern Europe'),
('OM', 'Oman', 'https://flagcdn.com/w320/om.png', 5106626, 'Muscat', 'Asia', 'Western Asia'),
('PK', 'Pakistan', 'https://flagcdn.com/w320/pk.png', 220892340, 'Islamabad', 'Asia', 'Southern Asia'),
('PW', 'Palau', 'https://flagcdn.com/w320/pw.png', 18094, 'Ngerulmud', 'Oceania', 'Micronesia'),
('PA', 'Panama', 'https://flagcdn.com/w320/pa.png', 4314767, 'Panama City', 'Americas', 'Central America'),
('PG', 'Papua New Guinea', 'https://flagcdn.com/w320/pg.png', 8947024, 'Port Moresby', 'Oceania', 'Melanesia'),
('PY', 'Paraguay', 'https://flagcdn.com/w320/py.png', 7132538, 'Asunción', 'Americas', 'South America'),
('PE', 'Peru', 'https://flagcdn.com/w320/pe.png', 32971854, 'Lima', 'Americas', 'South America'),
('PH', 'Philippines', 'https://flagcdn.com/w320/ph.png', 109581078, 'Manila', 'Asia', 'South-Eastern Asia'),
('PL', 'Poland', 'https://flagcdn.com/w320/pl.png', 37846611, 'Warsaw', 'Europe', 'Eastern Europe'),
('PT', 'Portugal', 'https://flagcdn.com/w320/pt.png', 10196709, 'Lisbon', 'Europe', 'Southern Europe'),
('QA', 'Qatar', 'https://flagcdn.com/w320/qa.png', 2881053, 'Doha', 'Asia', 'Western Asia'),
('RO', 'Romania', 'https://flagcdn.com/w320/ro.png', 19237691, 'Bucharest', 'Europe', 'Eastern Europe'),
('RU', 'Russia', 'https://flagcdn.com/w320/ru.png', 145934462, 'Moscow', 'Europe', 'Eastern Europe'),
('RW', 'Rwanda', 'https://flagcdn.com/w320/rw.png', 12952218, 'Kigali', 'Africa', 'Eastern Africa'),
('KN', 'Saint Kitts and Nevis', 'https://flagcdn.com/w320/kn.png', 53199, 'Basseterre', 'Americas', 'Caribbean'),
('LC', 'Saint Lucia', 'https://flagcdn.com/w320/lc.png', 183627, 'Castries', 'Americas', 'Caribbean'),
('VC', 'Saint Vincent and the Grenadines', 'https://flagcdn.com/w320/vc.png', 110940, 'Kingstown', 'Americas', 'Caribbean'),
('WS', 'Samoa', 'https://flagcdn.com/w320/ws.png', 198414, 'Apia', 'Oceania', 'Polynesia'),
('SM', 'San Marino', 'https://flagcdn.com/w320/sm.png', 33931, 'San Marino', 'Europe', 'Southern Europe'),
('ST', 'São Tomé and Príncipe', 'https://flagcdn.com/w320/st.png', 219159, 'São Tomé', 'Africa', 'Middle Africa'),
('SA', 'Saudi Arabia', 'https://flagcdn.com/w320/sa.png', 34813871, 'Riyadh', 'Asia', 'Western Asia'),
('SN', 'Senegal', 'https://flagcdn.com/w320/sn.png', 16743927, 'Dakar', 'Africa', 'Western Africa'),
('RS', 'Serbia', 'https://flagcdn.com/w320/rs.png', 8737371, 'Belgrade', 'Europe', 'Southern Europe'),
('SC', 'Seychelles', 'https://flagcdn.com/w320/sc.png', 98347, 'Victoria', 'Africa', 'Eastern Africa'),
('SL', 'Sierra Leone', 'https://flagcdn.com/w320/sl.png', 7976983, 'Freetown', 'Africa', 'Western Africa'),
('SG', 'Singapore', 'https://flagcdn.com/w320/sg.png', 5850342, 'Singapore', 'Asia', 'South-Eastern Asia'),
('SK', 'Slovakia', 'https://flagcdn.com/w320/sk.png', 5459642, 'Bratislava', 'Europe', 'Eastern Europe'),
('SI', 'Slovenia', 'https://flagcdn.com/w320/si.png', 2078938, 'Ljubljana', 'Europe', 'Southern Europe'),
('SB', 'Solomon Islands', 'https://flagcdn.com/w320/sb.png', 686884, 'Honiara', 'Oceania', 'Melanesia'),
('SO', 'Somalia', 'https://flagcdn.com/w320/so.png', 15893222, 'Mogadishu', 'Africa', 'Eastern Africa'),
('ZA', 'South Africa', 'https://flagcdn.com/w320/za.png', 59308690, 'Cape Town', 'Africa', 'Southern Africa'),
('SS', 'South Sudan', 'https://flagcdn.com/w320/ss.png', 11193725, 'Juba', 'Africa', 'Eastern Africa'),
('ES', 'Spain', 'https://flagcdn.com/w320/es.png', 46754778, 'Madrid', 'Europe', 'Southern Europe'),
('LK', 'Sri Lanka', 'https://flagcdn.com/w320/lk.png', 21413249, 'Colombo', 'Asia', 'Southern Asia'),
('SD', 'Sudan', 'https://flagcdn.com/w320/sd.png', 43849260, 'Khartoum', 'Africa', 'Northern Africa'),
('SR', 'Suriname', 'https://flagcdn.com/w320/sr.png', 586632, 'Paramaribo', 'Americas', 'South America'),
('SE', 'Sweden', 'https://flagcdn.com/w320/se.png', 10099265, 'Stockholm', 'Europe', 'Northern Europe'),
('CH', 'Switzerland', 'https://flagcdn.com/w320/ch.png', 8654622, 'Bern', 'Europe', 'Western Europe'),
('SY', 'Syria', 'https://flagcdn.com/w320/sy.png', 17500658, 'Damascus', 'Asia', 'Western Asia'),
('TJ', 'Tajikistan', 'https://flagcdn.com/w320/tj.png', 9537645, 'Dushanbe', 'Asia', 'Central Asia'),
('TZ', 'Tanzania', 'https://flagcdn.com/w320/tz.png', 59734218, 'Dodoma', 'Africa', 'Eastern Africa'),
('TH', 'Thailand', 'https://flagcdn.com/w320/th.png', 69799978, 'Bangkok', 'Asia', 'South-Eastern Asia'),
('TL', 'Timor-Leste', 'https://flagcdn.com/w320/tl.png', 1318445, 'Dili', 'Asia', 'South-Eastern Asia'),
('TG', 'Togo', 'https://flagcdn.com/w320/tg.png', 8278724, 'Lomé', 'Africa', 'Western Africa'),
('TO', 'Tonga', 'https://flagcdn.com/w320/to.png', 105695, 'Nukuʻalofa', 'Oceania', 'Polynesia'),
('TT', 'Trinidad and Tobago', 'https://flagcdn.com/w320/tt.png', 1399488, 'Port of Spain', 'Americas', 'Caribbean'),
('TN', 'Tunisia', 'https://flagcdn.com/w320/tn.png', 11818619, 'Tunis', 'Africa', 'Northern Africa'),
('TR', 'Turkey', 'https://flagcdn.com/w320/tr.png', 84339067, 'Ankara', 'Asia', 'Western Asia'),
('TM', 'Turkmenistan', 'https://flagcdn.com/w320/tm.png', 6031200, 'Ashgabat', 'Asia', 'Central Asia'),
('TV', 'Tuvalu', 'https://flagcdn.com/w320/tv.png', 11792, 'Funafuti', 'Oceania', 'Polynesia'),
('UG', 'Uganda', 'https://flagcdn.com/w320/ug.png', 45741007, 'Kampala', 'Africa', 'Eastern Africa'),
('UA', 'Ukraine', 'https://flagcdn.com/w320/ua.png', 43733762, 'Kyiv', 'Europe', 'Eastern Europe'),
('AE', 'United Arab Emirates', 'https://flagcdn.com/w320/ae.png', 9890402, 'Abu Dhabi', 'Asia', 'Western Asia'),
('GB', 'United Kingdom', 'https://flagcdn.com/w320/gb.png', 67886011, 'London', 'Europe', 'Northern Europe'),
('US', 'United States', 'https://flagcdn.com/w320/us.png', 331002651, 'Washington, D.C.', 'Americas', 'Northern America'),
('UY', 'Uruguay', 'https://flagcdn.com/w320/uy.png', 3473730, 'Montevideo', 'Americas', 'South America'),
('UZ', 'Uzbekistan', 'https://flagcdn.com/w320/uz.png', 33469203, 'Tashkent', 'Asia', 'Central Asia'),
('VU', 'Vanuatu', 'https://flagcdn.com/w320/vu.png', 307145, 'Port Vila', 'Oceania', 'Melanesia'),
('VA', 'Vatican City', 'https://flagcdn.com/w320/va.png', 801, 'Vatican City', 'Europe', 'Southern Europe'),
('VE', 'Venezuela', 'https://flagcdn.com/w320/ve.png', 28435940, 'Caracas', 'Americas', 'South America'),
('VN', 'Vietnam', 'https://flagcdn.com/w320/vn.png', 97338579, 'Hanoi', 'Asia', 'South-Eastern Asia'),
('YE', 'Yemen', 'https://flagcdn.com/w320/ye.png', 29825964, 'Sana''a', 'Asia', 'Western Asia'),
('ZM', 'Zambia', 'https://flagcdn.com/w320/zm.png', 18383955, 'Lusaka', 'Africa', 'Eastern Africa'),
('ZW', 'Zimbabwe', 'https://flagcdn.com/w320/zw.png', 14862924, 'Harare', 'Africa', 'Eastern Africa');

-- ========================================
-- 14. CREATE FAMILY MEMBERS TABLE AND UPDATE SCHEMA
-- ========================================

-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own family members" ON public.family_members;
CREATE POLICY "Users can manage their own family members" ON public.family_members
  FOR ALL USING (auth.uid() = user_id);

-- Add family_member_id column to visited_countries if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visited_countries' 
    AND column_name = 'family_member_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.visited_countries 
    ADD COLUMN family_member_id INTEGER REFERENCES public.family_members(id) ON DELETE CASCADE;
    
    -- Create index for the new column
    CREATE INDEX idx_visited_countries_family_member_id ON public.visited_countries(family_member_id);
  END IF;
END $$;

-- Update the unique constraint to include family_member_id
-- First drop the old constraint
ALTER TABLE public.visited_countries DROP CONSTRAINT IF EXISTS visited_countries_user_id_country_id_key;

-- Add new unique constraint that allows the same country to be visited by different family members
-- But prevents duplicate entries for the same user/family member/country combination
CREATE UNIQUE INDEX IF NOT EXISTS visited_countries_unique_idx 
ON public.visited_countries (user_id, COALESCE(family_member_id, 0), country_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE family_members_id_seq TO authenticated;

-- ========================================
-- 15. VERIFICATION AND SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Countries inserted: % rows', (SELECT COUNT(*) FROM countries);
    RAISE NOTICE 'Tables created: countries, user_profiles, visited_countries, family_members';
    RAISE NOTICE 'Functions created: handle_new_user, generate_unique_username, get_user_stats, get_user_countries_by_region, exec_sql, create_user_profiles_table';
    RAISE NOTICE 'Triggers created: on_auth_user_created, update_user_profiles_updated_at';
    RAISE NOTICE 'RLS enabled on all tables with appropriate policies';
    RAISE NOTICE '';
    RAISE NOTICE 'Your Family Travel Tracker database is ready to use!';
    RAISE NOTICE '========================================';
END $$;

-- Final verification queries
SELECT 'Schema verification complete' as status;
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('countries', 'user_profiles', 'visited_countries', 'family_members')
ORDER BY table_name, ordinal_position;
