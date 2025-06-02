"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_src_utils_clearAuth_ts";
exports.ids = ["_ssr_src_utils_clearAuth_ts"];
exports.modules = {

/***/ "(ssr)/./src/utils/clearAuth.ts":
/*!********************************!*\
  !*** ./src/utils/clearAuth.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   clearAuthState: () => (/* binding */ clearAuthState)\n/* harmony export */ });\n/* harmony import */ var _supabaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./supabaseClient */ \"(ssr)/./src/utils/supabaseClient.ts\");\n// Utility to completely clear authentication state\n\nasync function clearAuthState() {\n    try {\n        // Sign out from Supabase\n        await _supabaseClient__WEBPACK_IMPORTED_MODULE_0__.supabase.auth.signOut();\n        // Clear local storage\n        localStorage.clear();\n        // Clear session storage\n        sessionStorage.clear();\n        // Reload the page to reset all state\n        window.location.reload();\n    } catch (error) {\n        console.error('Error clearing auth state:', error);\n        // Even if there's an error, clear storage and reload\n        localStorage.clear();\n        sessionStorage.clear();\n        window.location.reload();\n    }\n}\n// Add this to global window object for easy access from console\nif (false) {}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvdXRpbHMvY2xlYXJBdXRoLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbURBQW1EO0FBQ1A7QUFFckMsZUFBZUM7SUFDcEIsSUFBSTtRQUNGLHlCQUF5QjtRQUN6QixNQUFNRCxxREFBUUEsQ0FBQ0UsSUFBSSxDQUFDQyxPQUFPO1FBRTNCLHNCQUFzQjtRQUN0QkMsYUFBYUMsS0FBSztRQUVsQix3QkFBd0I7UUFDeEJDLGVBQWVELEtBQUs7UUFFcEIscUNBQXFDO1FBQ3JDRSxPQUFPQyxRQUFRLENBQUNDLE1BQU07SUFDeEIsRUFBRSxPQUFPQyxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyw4QkFBOEJBO1FBQzVDLHFEQUFxRDtRQUNyRE4sYUFBYUMsS0FBSztRQUNsQkMsZUFBZUQsS0FBSztRQUNwQkUsT0FBT0MsUUFBUSxDQUFDQyxNQUFNO0lBQ3hCO0FBQ0Y7QUFFQSxnRUFBZ0U7QUFDaEUsSUFBSSxLQUE2QixFQUFFLEVBRWxDIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXFJ1YmVuXFxEZXNrdG9wXFxGYW1pbHktdHJhdmVsLXRyYWNrZXJcXHNyY1xcdXRpbHNcXGNsZWFyQXV0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBVdGlsaXR5IHRvIGNvbXBsZXRlbHkgY2xlYXIgYXV0aGVudGljYXRpb24gc3RhdGVcclxuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tICcuL3N1cGFiYXNlQ2xpZW50JztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckF1dGhTdGF0ZSgpIHtcclxuICB0cnkge1xyXG4gICAgLy8gU2lnbiBvdXQgZnJvbSBTdXBhYmFzZVxyXG4gICAgYXdhaXQgc3VwYWJhc2UuYXV0aC5zaWduT3V0KCk7XHJcbiAgICBcclxuICAgIC8vIENsZWFyIGxvY2FsIHN0b3JhZ2VcclxuICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xyXG4gICAgXHJcbiAgICAvLyBDbGVhciBzZXNzaW9uIHN0b3JhZ2VcclxuICAgIHNlc3Npb25TdG9yYWdlLmNsZWFyKCk7XHJcbiAgICBcclxuICAgIC8vIFJlbG9hZCB0aGUgcGFnZSB0byByZXNldCBhbGwgc3RhdGVcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY2xlYXJpbmcgYXV0aCBzdGF0ZTonLCBlcnJvcik7XHJcbiAgICAvLyBFdmVuIGlmIHRoZXJlJ3MgYW4gZXJyb3IsIGNsZWFyIHN0b3JhZ2UgYW5kIHJlbG9hZFxyXG4gICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XHJcbiAgICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xyXG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQWRkIHRoaXMgdG8gZ2xvYmFsIHdpbmRvdyBvYmplY3QgZm9yIGVhc3kgYWNjZXNzIGZyb20gY29uc29sZVxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAod2luZG93IGFzIGFueSkuY2xlYXJBdXRoID0gY2xlYXJBdXRoU3RhdGU7XHJcbn1cclxuIl0sIm5hbWVzIjpbInN1cGFiYXNlIiwiY2xlYXJBdXRoU3RhdGUiLCJhdXRoIiwic2lnbk91dCIsImxvY2FsU3RvcmFnZSIsImNsZWFyIiwic2Vzc2lvblN0b3JhZ2UiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlbG9hZCIsImVycm9yIiwiY29uc29sZSIsImNsZWFyQXV0aCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./src/utils/clearAuth.ts\n");

/***/ })

};
;