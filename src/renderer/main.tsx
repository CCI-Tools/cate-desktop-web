import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store, createStore, Middleware, applyMiddleware, Dispatch } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { ipcRenderer } from '../renderer_main/electron';
import ApplicationPage from './containers/ApplicationPage'
import { newWebAPIClient } from './webapi'
import { State } from './state';
import * as actions from './actions'
import { stateReducer } from './reducers';


export function main() {
    const middlewares: Middleware[] = [thunkMiddleware];

    if (process.env.NODE_ENV === 'development') {
        const nonLoggedActionTypes = new Set([
                                                 // Too much noise:
                                                 actions.SET_GLOBE_MOUSE_POSITION,
                                                 actions.SET_GLOBE_VIEW_POSITION,
                                                 actions.SET_GLOBE_VIEW_POSITION,
                                                 actions.UPDATE_MOUSE_IDLE_STATE,
                                             ]);
        const loggerOptions = {
            level: 'info',
            collapsed: true,
            diff: true,
            predicate: (getState, action) => !nonLoggedActionTypes.has(action.type)
        };
        middlewares.push(createLogger(loggerOptions));
    }

    const middleware = applyMiddleware(...middlewares);
    const store = createStore(stateReducer, middleware) as Store<State>;

    ipcRenderer.on('apply-initial-state', (event, initialState) => {
        store.dispatch(actions.updateInitialState(initialState) as any);
        connectWebAPIClient(store);
    });

    ipcRenderer.on('new-workspace', () => {
        store.dispatch(actions.newWorkspaceInteractive() as any);
    });

    ipcRenderer.on('open-workspace', () => {
        store.dispatch(actions.openWorkspaceInteractive() as any);
    });

    ipcRenderer.on('close-workspace', () => {
        store.dispatch(actions.closeWorkspaceInteractive() as any);
    });

    ipcRenderer.on('save-workspace', () => {
        store.dispatch(actions.saveWorkspaceInteractive() as any);
    });

    ipcRenderer.on('save-workspace-as', () => {
        store.dispatch(actions.saveWorkspaceAsInteractive());
    });

    ipcRenderer.on('show-preferences-dialog', () => {
        store.dispatch(actions.showPreferencesDialog());
    });

    ipcRenderer.on('get-preferences', () => {
        store.dispatch(actions.sendPreferencesToMain() as any);
    });

    document.addEventListener('drop', function (event: any) {
        event.preventDefault();
        event.stopPropagation();
        for (let file of event.dataTransfer.files) {
            readDroppedFile(file, store.dispatch);
        }
    });

    document.addEventListener('dragover', function (event: any) {
        event.preventDefault();
        event.stopPropagation();
    });
}

function connectWebAPIClient(store: Store<State>) {
    store.dispatch(actions.setWebAPIStatus(null, 'connecting'));

    const webAPIConfig = store.getState().data.appConfig.webAPIConfig;
    console.log('webAPIConfig:', webAPIConfig);
    const webAPIClient = newWebAPIClient(webAPIConfig.apiWebSocketUrl);

    webAPIClient.onOpen = () => {
        store.dispatch(actions.setWebAPIStatus(webAPIClient, 'open'));
        store.dispatch(actions.loadBackendConfig() as any);
        store.dispatch(actions.loadDataStores() as any);
        store.dispatch(actions.loadOperations() as any);
        store.dispatch(actions.loadInitialWorkspace() as any);

        ReactDOM.render(
            <Provider store={store}>
                <ApplicationPage/>
            </Provider>,
            document.getElementById('container')
        );
    };

    webAPIClient.onClose = () => {
        store.dispatch(actions.setWebAPIStatus(null, 'closed'));
    };

    webAPIClient.onError = () => {
        store.dispatch(actions.setWebAPIStatus(webAPIClient, 'error'));
    };

    webAPIClient.onWarning = (event) => {
        console.warn(`cate-desktop: warning from cate-webapi: ${event.message}`);
    };
}

function readDroppedFile(file: File, dispatch: Dispatch<State>) {
    let opName, opArgs;
    if (file.name.endsWith('.nc')) {
        opName = 'read_netcdf';
        // opArgs = {file: {value: file.path}, normalize: {value: false}}
    } else if (file.name.endsWith('.txt')) {
        opName = 'read_text';
    } else if (file.name.endsWith('.json')) {
        opName = 'read_json';
    } else if (file.name.endsWith('.csv')) {
        opName = 'read_csv';
    } else if (file.name.endsWith('.geojson') || file.name.endsWith('.shp') || file.name.endsWith('.gml')) {
        opName = 'read_geo_data_frame';
    }
    if (!opArgs) {
        opArgs = {file: {value: file.name}};
    }
    if (opName) {
        dispatch(actions.setWorkspaceResource(opName,
                                              opArgs,
                                              null,
                                              false,
                                              `Reading dropped file ${file.name}`) as any);
    } else {
        console.warn('Dropped file of unrecognized type: ', file.name);
    }
}

