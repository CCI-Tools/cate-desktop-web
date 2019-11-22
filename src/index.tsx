// import * as serviceWorker from './serviceWorker';
import { main } from './renderer/main';

import './index.css';


/*
    <link href="node_modules/@blueprintjs/core/dist/blueprint.css" rel="stylesheet"/>
    <link href="node_modules/@blueprintjs/table/dist/table.css" rel="stylesheet"/>
    <link href="node_modules/@blueprintjs/datetime/dist/blueprint-datetime.css" rel="stylesheet"/>
 */
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/table/lib/css/table.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';


main();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
