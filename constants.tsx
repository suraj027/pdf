
import React from 'react';

export const PDF_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-500">
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 10.5 3H5.625Zm3.75 0V7.5h6V1.5h-6Z" />
    <path d="M12.75 12.75a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75Z" />
    <path d="M12 15a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 12 15Z" />
    <path d="M12.75 18.75a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75Z" />
  </svg>
);

export const SUMMARY_ICON = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
  
export const CHAT_ICON = (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.75 6.75 0 0 0 6.75-6.75v-2.53a.75.75 0 0 1 .673-.746 10.494 10.494 0 0 1 5.052-1.411.75.75 0 0 1 .747.673v1.262a.75.75 0 0 0 .746.673 10.494 10.494 0 0 0 3.948-1.155.75.75 0 0 0 .417-1.065A18.683 18.683 0 0 0 12.75 3.126a18.79 18.79 0 0 0-8.953 2.438.75.75 0 0 0-.417 1.065 10.493 10.493 0 0 0 3.948 1.155.75.75 0 0 0 .746-.673v-1.262a.75.75 0 0 1 .747-.673 10.494 10.494 0 0 1 5.052 1.411.75.75 0 0 1 .673.746V15a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75v-2.53a.75.75 0 0 0-.673-.746A10.494 10.494 0 0 0 .924 9.714a.75.75 0 0 0-1.065.417A18.683 18.683 0 0 0 7.5 22.875c.624 0 1.23-.05 1.816-.15Z" clipRule="evenodd" />
</svg>
);

export const PODCAST_ICON_OLD = ( // Renamed to avoid conflict if a new one is defined with same name
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
    <path d="M6 10.5a.75.75 0 0 1 .75.75v.75a4.5 4.5 0 0 0 9 0V11.25a.75.75 0 0 1 1.5 0v.75a6 6 0 0 1-12 0v-.75a.75.75 0 0 1 .75-.75Z" />
</svg>
);

export const UPLOAD_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21 6.75l-3.75-3.75L18.75 1.5 22.5 5.25 21 6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const AUDIO_WAVE_ICON_OLD = ( // Renamed
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 003.05 15H1.5a.75.75 0 000 1.5h1.55a9.76 9.76 0 001.808 3.495c.342 1.241 1.519 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.099 3.1 3.099 8.132 0 11.232a.75.75 0 01-1.06-1.06 6.996 6.996 0 000-9.112.75.75 0 010-1.06zm2.474-2.474a.75.75 0 011.06 0C25.137 5.65 25.137 15.73 19.122 19.122a.75.75 0 01-1.06-1.061c5.303-5.303 5.303-13.939 0-19.242a.75.75 0 010-1.061z" />
    </svg>
);

export const PLUS_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const OPEN_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.75A.75.75 0 0115 6h.75M15 6h2.25M15 6V3.75A2.25 2.25 0 0012.75 1.5h-7.5A2.25 2.25 0 003 3.75v16.5A2.25 2.25 0 005.25 22.5H18.75a2.25 2.25 0 002.25-2.25V10.5A2.25 2.25 0 0018.75 8.25h-4.5" />
  </svg>
);

export const TRASH_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.462 3.032 1.227m-3.032-1.227c-.933 1.788-1.96 4.084-3.032 6.372m13.032-6.372c.933 1.788 1.96 4.084 3.032 6.372m-3.032-6.372l.653-.352c.407-.22.814-.44.653-.673m-3.032-6.372c.653.22.814.44.653.673m0 0l-.352.653m-3.032-6.372c-.22-.407-.44-.814-.673-.653m-3.032-6.372l-.352-.653m0 0c.22-.407.44-.814.673-.653" />
  </svg>
);

export const GRID_VIEW_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

export const LIST_VIEW_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
  </svg>
);

export const ELLIPSIS_VERTICAL_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

export const CHEVRON_DOWN_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const APP_LOGO_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-100"> {/* Default size, can be overridden */}
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 10.5 3H5.625Zm3.75 0V7.5h6V1.5h-6Z" />
    <path d="M12.75 12.75a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75Z" />
    <path d="M12 15a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 12 15Z" />
    <path d="M12.75 18.75a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75Z" />
  </svg>
);

export const CLOSE_ICON_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const UPLOAD_AREA_ICON_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-slate-500">
    <path fillRule="evenodd" d="M10.5 3.75a2.25 2.25 0 00-2.25 2.25v4.5c0 .414.336.75.75.75h6a.75.75 0 00.75-.75v-4.5a2.25 2.25 0 00-2.25-2.25h-2.25zm.75 2.25v.75h3v-.75a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75zm0 3v.75h3v-.75h-3z" clipRule="evenodd" />
    <path d="M5.25 7.5A2.25 2.25 0 003 9.75v8.516c0 .965.668 1.812 1.608 2.093L7.5 21.484V13.5H5.25V9.75zM16.5 13.5v7.984l2.892-1.125c.94-.365 1.608-1.212 1.608-2.093V9.75A2.25 2.25 0 0018.75 7.5H16.5v6z" />
    <path fillRule="evenodd" d="M7.5 13.5H6v8.758l.375.146a3.752 3.752 0 006.25 0L18 22.258V13.5h-1.5v7.69l-.071.027a2.252 2.252 0 01-3.758 0L12 21.191v-7.69l-.071.027a2.252 2.252 0 01-3.758 0L7.5 21.19V13.5z" clipRule="evenodd" />
  </svg>
);
export const APP_UPLOAD_ICON = UPLOAD_AREA_ICON_SVG;

export const HAMBURGER_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-1.5 5.25h16.5" />
  </svg>
);

export const CLOSE_ICON_PANEL = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const LIGHTBULB_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a3.375 3.375 0 01-3 0m-1.254-5.161a3.375 3.375 0 016.258 0M12 6.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
  </svg>
);

export const QUIZ_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

export const COMPASS_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0P6.343 12m5.657 9L12 6.343" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8-9h-1M4 12H3m15.364-5.364l-.707-.707M5.343 18.657l-.707-.707m12.728 0l-.707.707M6.05 6.05l-.707.707" />
  </svg>
);
