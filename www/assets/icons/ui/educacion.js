/* ICONOS UI · aprendizaje, misiones y laboratorio (las medallas llevan color propio) */
Icons.add('ui', 'cap', '<path d="M2.500 9.500L12 5l9.500 4.500L12 14z"/><path d="M6.500 11.500V16c1.500 1.500 3.500 2.200 5.500 2.200s4-.7 5.500-2.200v-4.500M21.500 9.500V15"/>');
Icons.add('ui', 'trophy', '<g stroke="#f2b632"><path d="M7.500 4h9v5a4.500 4.500 0 01-9 0z" fill="#f2b632" fill-opacity=".25"/><path d="M7.500 6h-3v1.500a3 3 0 003 3M16.500 6h3v1.500a3 3 0 01-3 3M12 13.500V17M8.500 20.500h7M10 17h4v3.500h-4z"/></g>');
[['medal-gold', '#f2b632'], ['medal-silver', '#aeb8c4'], ['medal-bronze', '#c7803f']].forEach(([n, c]) =>
  Icons.add('ui', n, `<g stroke="${c}"><circle cx="12" cy="14.500" r="5.500" fill="${c}" fill-opacity=".3"/><path d="M8.500 3.500L11 9.500M15.500 3.500L13 9.500M12 12v5"/></g>`));
Icons.add('ui', 'flask', '<path d="M9.500 3.500h5M10.500 3.500v6L5 19a1.500 1.500 0 001.300 2.200h11.400A1.500 1.500 0 0019 19l-5.500-9.500v-6"/><path d="M7.500 15h9"/>');
Icons.add('ui', 'microscope', '<rect x="9.500" y="3" width="4.500" height="9" rx="1" transform="rotate(20 11.750 7.500)"/><path d="M7.500 15.500a5.500 5.500 0 007.500-5.500M5 20.500h14M11 17.500v3"/>');
Icons.add('ui', 'telescope', '<path d="M3 11.500l13-5 2 5.200-13 5z"/><path d="M12 14.500l-3 6M12 14.500l3 6M16 6.500l-.8-2"/>');
Icons.add('ui', 'book', '<path d="M4 5.500A2 2 0 016 3.500h13v15H6a2 2 0 00-2 2z"/><path d="M4 20.500a2 2 0 002 2h13M8.500 8h6"/>');
Icons.add('ui', 'books', '<rect x="3" y="4" width="4.500" height="16" rx="1"/><rect x="9" y="4" width="4.500" height="16" rx="1"/><path d="M15.500 6.500l4.300-1.100L22 18.300l-4.500 1.100z"/>');
Icons.add('ui', 'notes', '<rect x="4.500" y="3.500" width="15" height="17" rx="2"/><path d="M8 8.500h8M8 12h8M8 15.500h4.500"/>');
Icons.add('ui', 'wave', '<path d="M2.500 9c2.500-3 4.500-3 7 0s4.500 3 7 0 3-2 5 0M2.500 15c2.500-3 4.500-3 7 0s4.500 3 7 0 3-2 5 0"/>');
Icons.add('ui', 'hand', '<path d="M8.500 11V6a1.500 1.500 0 013 0v4M11.500 10V4.500a1.500 1.500 0 013 0V10M14.500 10V6a1.500 1.500 0 013 0v7.500c0 4-2.500 7-6.500 7-3 0-4.500-1.500-6-4l-2-3.500a1.500 1.500 0 012.500-1.500L8.500 14"/>');
