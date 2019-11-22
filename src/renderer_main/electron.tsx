
class IpcRenderer {

    sendSync(channel: string, ...args) {
        console.warn("IpcRenderer.sendSync() not implemented: ", channel, args);
        // TODO: implement me.
    }

    send(channel: string, ...args) {
        console.warn("IpcRenderer.send() not implemented: ", channel, args);
        // TODO: implement me.
    }

    on(channel: string, listener: (event, ...args) => void) {
        if (channel === 'apply-initial-state') {
            listener({}, _APP_INITIAL_STATE);
            return;
        }

        console.warn("IpcRenderer.on() not implemented: ", channel);

        // TODO: implement me.
    }

    once(channel: string, listener: (event: any, ...args) => void) {
        console.warn("IpcRenderer.once() not implemented: ", channel);
        // TODO: implement me.
    }
}


class Shell {
    openExternal(path: string): boolean {
        // TODO: implement me. may open new browser window using path
        console.warn("Shell.openExternal() not implemented: ", path);
        return false;
    }

    showItemInFolder(path: string): boolean {
        // TODO: implement me. may show workspace file in new browser window
        console.warn("Shell.showItemInFolder() not implemented: ", path);
        return false;
    }

    openItem(path: string): boolean {
        // TODO: implement me. No idea here...
        console.warn("Shell.openItem() not implemented: ", path);
        return false;
    }
}


class Clipboard {
    writeText(text: string) {
        // TODO: implement me. No idea here...
        console.warn("Clipboard.writeText() not implemented: ", text);
    }
}

export const ipcRenderer = new IpcRenderer();
export const shell = new Shell();
export const clipboard = new Clipboard();



const _APP_INITIAL_STATE = {
    'appConfig': {
        'NODE_ENV': 'development',
        'appPath': 'D:\\Projects\\cate-desktop\\app',
        'devToolsExtensions': [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS',
            'REACT_PERF'
        ],
        'prefsFile': null,
        'webAPIConfig': {
            'apiWebSocketUrl': 'ws://localhost:9090/api',
            'mplWebSocketUrl': 'ws://localhost:9090/mpl/figures/',
            'processOptions': {},
            'restUrl': 'http://localhost:9090/',
            'serviceAddress': '',
            'serviceFile': 'webapi-info.json',
            'servicePort': 9090
        }
    },
    'session': {
        'autoShowNewFigures': true,
        'autoUpdateSoftware': true,
        'dataSourceFilterExpr': 'sst',
        'dataSourceListHeight': 327,
        'debugWorldView': false,
        'defaultPlacemarkStyle': {
            'fill': '#0000ff',
            'fillOpacity': 0.5,
            'markerColor': '#ff0000',
            'markerSize': 'small',
            'markerSymbol': '',
            'stroke': '#ffff00',
            'strokeOpacity': 0.5,
            'strokeWidth': 1
        },
        'devToolsOpened': false,
        'lastWorkspacePath': null,
        'layerListHeight': 160,
        'leftPanelContainerLayout': {
            'horPos': 432,
            'verPos': 548
        },
        'mainWindowBounds': {
            'height': 1056,
            'width': 1936,
            'x': -8,
            'y': -8
        },
        'offlineMode': false,
        'operationFilterExpr': 'read',
        'operationFilterTags': [],
        'operationListHeight': 202,
        'panelContainerUndockedMode': false,
        'placemarkCollection': {
            'features': [
                {
                    'geometry': {
                        'coordinates': [
                            11.695107685063984,
                            54.35273676857189
                        ],
                        'type': 'Point'
                    },
                    'id': 'placemark-f912793a-26e0-4600-9353-f50200282e9f',
                    'properties': {
                        'fill': '#0000ff',
                        'fill-opacity': 0.5,
                        'marker-color': '#ff0000',
                        'marker-size': 'small',
                        'marker-symbol': '1',
                        'stroke': '#ffff00',
                        'stroke-opacity': 0.5,
                        'stroke-width': 1,
                        'title': 'Point 1',
                        'visible': true
                    },
                    'type': 'Feature'
                },
                {
                    'geometry': {
                        'coordinates': [
                            13.059,
                            55.0475
                        ],
                        'type': 'Point'
                    },
                    'id': 'placemark-11cc6aab6-16e835d5026',
                    'properties': {
                        'fill': '#0000ff',
                        'fill-opacity': 0.5,
                        'marker-color': '#ff0000',
                        'marker-size': 'small',
                        'marker-symbol': '2',
                        'stroke': '#ffff00',
                        'stroke-opacity': 0.5,
                        'stroke-width': 1,
                        'title': 'Point 2',
                        'visible': true
                    },
                    'type': 'Feature'
                },
                {
                    'geometry': {
                        'coordinates': [
                            [
                                [
                                    14.089238858918012,
                                    55.07944244010898
                                ],
                                [
                                    13.579957382313822,
                                    54.76492629341859
                                ],
                                [
                                    14.485379377969824,
                                    54.407785633196596
                                ],
                                [
                                    14.670266169835324,
                                    54.815736743347465
                                ],
                                [
                                    14.089238858918012,
                                    55.07944244010898
                                ]
                            ]
                        ],
                        'type': 'Polygon'
                    },
                    'id': 'placemark-6970fb67-574f-454b-b66f-3b6cb9ae5f3a',
                    'properties': {
                        'fill': '#0000ff',
                        'fill-opacity': 0.5,
                        'marker-color': '#ff0000',
                        'marker-size': 'small',
                        'marker-symbol': '',
                        'stroke': '#ffff00',
                        'stroke-opacity': 0.5,
                        'stroke-width': 1,
                        'title': 'Polygon 1',
                        'visible': true
                    },
                    'type': 'Feature'
                }
            ],
            'type': 'FeatureCollection'
        },
        'placemarkListHeight': 160,
        'reopenLastWorkspace': false,
        'resourceListHeight': 100,
        'rightPanelContainerLayout': {
            'horPos': 389,
            'verPos': 507
        },
        'savedLayers': {
            'analysed_sst': {
                'alphaBlending': false,
                'brightness': 1,
                'colorMapName': 'jet',
                'contrast': 1,
                'displayMax': 310,
                'displayMin': 270,
                'gamma': 1,
                'hue': 0,
                'id': 'auto',
                'name': 'Auto ds_3.analysed_sst',
                'opacity': 1,
                'resId': 1,
                'resName': 'ds_3',
                'saturation': 1,
                'splitMode': 'off',
                'type': 'VariableImage',
                'varIndex': [
                    1
                ],
                'varName': 'analysed_sst',
                'visible': true
            },
            'diff': {
                'alphaBlending': false,
                'brightness': 1,
                'colorMapName': 'PuOr',
                'contrast': 1,
                'displayMax': 2.88,
                'displayMin': -1.18,
                'gamma': 1,
                'hue': 0,
                'id': 'auto',
                'name': 'Auto res_1.diff',
                'opacity': 1,
                'resId': 2,
                'resName': 'res_1',
                'saturation': 1,
                'splitMode': 'off',
                'statistics': {
                    'max': 2.88,
                    'min': -1.18
                },
                'type': 'VariableImage',
                'varIndex': [],
                'varName': 'diff',
                'visible': true
            }
        },
        'selectedDataSourceId': 'esacci.SST.day.L4.SSTdepth.multi-sensor.multi-platform.OSTIA.1-1.r1',
        'selectedDataStoreId': 'esa_cci_odp',
        'selectedLeftBottomPanelId': 'operations',
        'selectedLeftTopPanelId': 'dataSources',
        'selectedOperationName': 'read_netcdf',
        'selectedPlacemarkId': null,
        'selectedRightBottomPanelId': 'variables',
        'selectedRightTopPanelId': 'workspace',
        'showDataSourceDetails': true,
        'showDataSourceIdsOnly': false,
        'showDataSourceTitles': true,
        'showDataStoreDescription': false,
        'showDataStoreNotices': false,
        'showLayerDetails': true,
        'showLayerTextOverlay': true,
        'showOperationDetails': true,
        'showPlacemarkDetails': true,
        'showResourceDetails': true,
        'showSelectedVariableLayer': true,
        'showVariableDetails': true,
        'showWorkflowStepDetails': true,
        'styleContext': 'layer',
        'suppressQuitConfirm': false,
        'variableListHeight': 178,
        'workflowStepListHeight': 100,
        'workspacePanelMode': 'resources'
    }
};
