// in App.js
import {library} from '@fortawesome/fontawesome-svg-core';
import {fab} from '@fortawesome/free-brands-svg-icons';
import {faIcons} from '@fortawesome/free-solid-svg-icons/faIcons';
import {faEllipsis} from '@fortawesome/free-solid-svg-icons/faEllipsis';

export default () => {
  console.log('seteando iconos');
  library.add(fab, faIcons, faEllipsis);
};
