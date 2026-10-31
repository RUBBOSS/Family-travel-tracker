import type { Dictionary } from './en';

/** Русский */
export const ru: Dictionary = {
  // Common
  'common.signIn': 'Войти',
  'common.signOut': 'Выйти',
  'common.cancel': 'Отмена',
  'common.clear': 'Очистить',
  'common.close': 'Закрыть окно',
  'common.remove': 'Удалить',
  'common.you': 'вы',
  'common.everyone': 'Все',
  'common.exploringAs': 'Путешествует',
  'common.loading': 'Загрузка…',

  // Landing
  'landing.heroTitle': 'Каждое путешествие вашей семьи — на одной сияющей карте.',
  'landing.heroSubtitle':
    'Раскрасьте мир по путешественникам. Сохраняйте даты, заметки и истории. Планируйте новое — и делитесь всеми странствиями одной ссылкой.',
  'landing.ctaDemo': 'Попробовать демо',
  'landing.ctaCreate': 'Создать аккаунт',
  'landing.ctaOpenMyMap': 'Открыть мою карту',
  'landing.ctaOpenApp': 'Открыть приложение',
  'landing.demoError': 'Демо прогревается — попробуйте через минуту.',
  'landing.feature1Title': 'Одна карта — все путешественники',
  'landing.feature1Text':
    'У каждого члена семьи свой цвет. Поездки всех накладываются на одну карту мира — переключайте вид одним касанием или смотрите всё сразу.',
  'landing.feature2Title': 'Истории, а не просто точки',
  'landing.feature2Text':
    'Даты и заметки хранятся вместе с каждой страной — «тот вечер в Киото» легко найти и спустя годы. Добавляйте мечты в список желаний и превращайте их в воспоминания.',
  'landing.feature3Title': 'Ссылка, которая рассказывает всё',
  'landing.feature3Text':
    'У каждой семейной карты есть публичная страница. Бабушки и дедушки, друзья, турагенты — любой по ссылке увидит все путешествия. Без регистрации.',
  'landing.proofCountries': 'стран для открытия',
  'landing.proofLegends': 'семейных историй сохранено',
  'landing.proofLink': 'ссылка, чтобы поделиться всем',
  'landing.finalTitle': 'Где побывала ваша семья?',
  'landing.finalCtaDemo': 'Открыть демо-карту',
  'landing.footer': 'Family Travel Tracker — для семей, которые меряют жизнь штампами в паспорте.',

  // Auth
  'auth.panelTitle': 'Каждое путешествие вашей семьи — на одной сияющей карте.',
  'auth.panelText':
    'Раскрашивайте мир по путешественникам, сохраняйте заметки и даты, планируйте новое — и делитесь картой по ссылке.',
  'auth.bullet1': '193 страны готовы быть раскрашенными',
  'auth.bullet2': 'У каждого члена семьи свой цвет',
  'auth.panelFooter': 'Начните своё путешествие уже сегодня.',
  'auth.tabSignIn': 'Вход',
  'auth.tabCreate': 'Регистрация',
  'auth.username': 'Имя пользователя',
  'auth.email': 'Эл. почта',
  'auth.password': 'Пароль',
  'auth.usernamePlaceholder': 'alice_explorer',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.passwordPlaceholder': '••••••••',
  'auth.errorUsername': 'Придумайте имя пользователя.',
  'auth.btnSignIn': 'Войти',
  'auth.btnCreate': 'Создать аккаунт',
  'auth.btnLoading': 'Секунду…',
  'auth.switchToRegister': 'Впервые здесь? ',
  'auth.switchToRegisterLink': 'Создать аккаунт',
  'auth.switchToLogin': 'Уже путешествуете с нами? ',
  'auth.switchToLoginLink': 'Войти',

  // Tracker header / chrome
  'tracker.appTitle': 'Семейный трекер путешествий',
  'tracker.appTitleShort': 'Трекер путешествий',

  // Stats
  'stats.journey': 'Путешествия на сегодня',
  'stats.memberJourney': 'Путешествия: {name}',
  'stats.countriesVisited': 'стран посещено',
  'stats.ofFamilyTotal': 'из {n} стран семьи',
  'stats.explorers': 'путешественник|путешественника|путешественников',
  'stats.leaderboard': 'Семейный рейтинг',
  'stats.youName': '{name} (вы)',
  'stats.ofWorld': 'мира',
  'stats.error': 'Не удалось загрузить статистику. {error}',

  // Members
  'members.title': 'Члены семьи',
  'members.add': 'Добавить',
  'members.emptyTitle': 'Пока никого, кроме вас',
  'members.emptyText': 'Добавьте члена семьи — и раскрашивайте карту вместе.',
  'members.removeAria': 'Удалить {name}',
  'members.dialogTitle': 'Добавить члена семьи',
  'members.nameLabel': 'Имя',
  'members.namePlaceholder': 'напр. Эмма',
  'members.colorLabel': 'Его цвет на карте',
  'members.customColor': 'Свой цвет',
  'members.preview': 'Превью',
  'members.previewHint': 'Так будет выглядеть {name}',
  'members.previewHintEmpty': 'Так будет выглядеть плашка',
  'members.errorName': 'Сначала введите имя.',
  'members.confirmTitle': 'Удалить члена семьи',
  'members.confirmText':
    'Удалить этого члена семьи? Все его поездки и посещённые страны будут удалены навсегда.',
  'members.confirmKeep': 'Оставить',
  'members.confirmRemove': 'Удалить',
  'members.undoneNote': 'Действие необратимо. Все связанные данные о поездках будут удалены безвозвратно.',
  'members.role': 'Член семьи',
  'members.deleteFailed': 'Не удалось удалить {name}. Попробуйте ещё раз.',

  // Search / add country
  'search.title': 'Добавить страну',
  'search.addingFor': 'Добавляем для',
  'search.placeholder': 'Какую страну вы посетили?',
  'search.when': 'Когда',
  'search.notes': 'Заметки',
  'search.notesOptional': 'необязательно',
  'search.notesPlaceholder': 'Воспоминание из поездки…',
  'search.addToMap': 'На карту',
  'search.wishlist': 'В желания',
  'search.wishlisted': 'В списке',
  'search.wishlistTitle': 'Добавить в список желаний (спланировать поездку)',
  'search.wishlistedTitle': 'Уже в списке желаний',
  'search.noMatch': 'Ничего не найдено: «{q}»',
  'search.loadingCountries': 'Загружаем страны…',

  // Map
  'map.title': 'Карта мира',
  'map.publicMap': 'Публичная карта',
  'map.familyWorld': 'Мир семьи {name}',
  'map.personalWorld': 'Мир: {name}',
  'map.memberWorld': 'Мир: {name}',
  'map.defaultTitle': 'Карта мира семьи',
  'map.countriesVisited': '{n} страна|{n} страны|{n} стран',
  'map.visited': 'Посещено',
  'map.bucketLegend': 'Список желаний',
  'map.notVisited': 'Не посещено',
  'map.empty': 'Стран пока не отмечено — добавьте первую и смотрите, как карта загорается.',

  // Table
  'table.title': 'Посещённые страны',
  'table.colCountry': 'Страна',
  'table.colVisited': 'Дата',
  'table.colNotes': 'Заметки',
  'table.emptyTitle': 'Пока ничего не отмечено',
  'table.emptyText': 'Добавьте первую страну — и карта оживёт.',
  'table.removeAria': 'Удалить {name}',

  // Bucket list
  'bucket.title': 'Список желаний',
  'bucket.placesToGo': '{n} место в планах|{n} места в планах|{n} мест в планах',
  'bucket.emptyTitle': 'Планов пока нет',
  'bucket.emptyText':
    'Отмечайте страны звёздочкой — они попадут в список желаний и появятся пунктиром на карте.',
  'bucket.wentThere': 'Там были',
  'bucket.wentThereTitle': 'Отметить поездку как состоявшуюся',

  // Share page
  'share.makeYourOwn': 'Создайте свою карту',
  'share.headline': '{n} стран. Одна семья.',
  'share.subtitle': '{p}% мира исследовано вместе',
  'share.withMembers': ' — вместе с {names}',
  'share.explorers': 'Путешественники',
  'share.latest': 'Последние приключения',
  'share.notFoundTitle': 'Здесь нет путешественника',
  'share.notFoundText': 'Возможно, ссылка неверная — или этой карты ещё не существует.',
  'share.notFoundCta': 'Открыть Family Travel Tracker',
  'share.finalTitle': 'Где побывала ваша семья?',
  'share.finalCta': 'Создать семейную карту',

  // 404
  'nf.title': 'Вне карты',
  'nf.text': 'Этой страницы нет ни на одной из наших карт. Вернём вас на знакомую территорию.',
  'nf.cta': 'Вернуться к трекеру',

  // Toasts
  'toast.countryAdded': 'Страна добавлена!',
  'toast.countryRemoved': 'Страна удалена',
  'toast.bucketAdded': 'Добавлено в список желаний',
  'toast.bucketRemoved': 'Удалено из списка желаний',
  'toast.sessionExpired': 'Сессия истекла — войдите заново.',

  // Language switcher
  'lang.aria': 'Сменить язык',
} as const;
