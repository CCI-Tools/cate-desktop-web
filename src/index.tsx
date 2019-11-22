// import * as serviceWorker from './serviceWorker';
import { main } from './renderer/main';

import './index.css';


/*
    <link href="node_modules/@blueprintjs/core/dist/blueprint.css" rel="stylesheet"/>
    <link href="node_modules/@blueprintjs/table/dist/table.css" rel="stylesheet"/>
    <link href="node_modules/@blueprintjs/datetime/dist/blueprint-datetime.css" rel="stylesheet"/>
 */
import '@blueprintjs/core/dist/blueprint.css';
import '@blueprintjs/table/dist/table.css';
import '@blueprintjs/datetime/dist/blueprint-datetime.css';


main();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
