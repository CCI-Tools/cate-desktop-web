import {
    VariableState, VariableRefState, ResourceState, LayerState,
    VariableImageLayerState, OperationState, WorldViewDataState,
    TableViewDataState, FigureViewDataState, SavedLayers, VariableDataRefState, ResourceRefState,
    ResourceVectorLayerState, VectorLayerBase, Placemark, PlacemarkCollection, AnimationViewDataState,
    DimSizes, SPLIT_MODE_OFF
} from "./state";
import {ViewState} from "./components/ViewState";
import * as assert from "../common/assert";
import {isNumber, isString} from "../common/types";
import {EMPTY_ARRAY, EMPTY_OBJECT} from "./selectors";
import * as Cesium from "cesium";
import {GeometryWKTGetter} from "./containers/editor/ValueEditor";
import {entityToGeometryWkt} from "./components/cesium/cesium-util";
import {SIMPLE_STYLE_DEFAULTS, SimpleStyle} from "../common/geojson-simple-style";

export const AUTO_LAYER_ID = 'auto';
export const COUNTRIES_LAYER_ID = 'countries';
export const MY_PLACES_LAYER_ID = 'myPlaces';

export const AUTO_LAYER = {
    id: AUTO_LAYER_ID,
    type: 'Unknown',
    visible: true,
};

export const COUNTRIES_LAYER = {
    id: COUNTRIES_LAYER_ID,
    name: 'Countries',
    type: 'Vector',
    visible: false,
    style: {
        ...SIMPLE_STYLE_DEFAULTS,
        fill: "#FFFFFF",
    },
};

export const MY_PLACES_LAYER = {
    id: MY_PLACES_LAYER_ID,
    name: 'My Places',
    type: 'Vector',
    visible: true,
    style: {
        markerSize: "small",
        markerColor: "#ff0000",
        markerSymbol: "",
        fill: "#0000ff",
        fillOpacity: 0.5,
        stroke: "#ffff00",
        strokeOpacity: 0.5,
        strokeWidth: 1,
    },
};

export const PLACEMARK_ID_PREFIX = "placemark-";

export function getTileUrl(baseUrl: string, baseDir: string, layer: VariableImageLayerState): string {
    return baseUrl + `ws/res/tile/${encodeURIComponent(baseDir)}/${layer.resId}/{z}/{y}/{x}.png?`
           + `&var=${encodeURIComponent(layer.varName)}`
           + `&index=${encodeURIComponent((layer.varIndex || []).join())}`
           + `&cmap=${encodeURIComponent(layer.colorMapName) + (layer.alphaBlending ? '_alpha' : '')}`
           + `&min=${encodeURIComponent(layer.displayMin + '')}`
           + `&max=${encodeURIComponent(layer.displayMax + '')}`;
}

export function getFeatureCollectionUrl(baseUrl: string, baseDir: string, ref: ResourceRefState): string {
    return baseUrl + `ws/res/geojson/${encodeURIComponent(baseDir)}/${ref.resId}`;
}

export function getFeatureUrl(baseUrl: string, baseDir: string, ref: ResourceRefState, index: number): string {
    return baseUrl + `ws/res/geojson/${encodeURIComponent(baseDir)}/${ref.resId}/${index}`;
}

export function getCsvUrl(baseUrl: string, baseDir: string, ref: ResourceRefState, varName?: string | null): string {
    let varPart = '';
    if (varName) {
        varPart = `?var=${encodeURIComponent(varName)}`;
    }
    return baseUrl + `ws/res/csv/${encodeURIComponent(baseDir)}/${ref.resId}${varPart}`;
}

export function getHtmlUrl(baseUrl: string, baseDir: string, resId: number): string {
    return baseUrl + `ws/res/html/${encodeURIComponent(baseDir)}/${resId}`;
}

export function getGeoJSONCountriesUrl(baseUrl: string): string {
    return baseUrl + 'ws/countries';
}

export function getMPLWebSocketUrl(baseUrl: string, baseDir: string, figureId: number): string {
    return `${baseUrl}${encodeURIComponent(baseDir)}/${encodeURIComponent('' + figureId)}`;
}

export function getMPLDownloadUrl(baseUrl: string, baseDir: string, figureId: number): string {
    return `${baseUrl}mpl/download/${encodeURIComponent(baseDir)}/${encodeURIComponent('' + figureId)}`;
}

export function isSpatialImageVariable(variable: VariableState): boolean {
    return variable.numDims && variable.numDims >= 2 && !!variable.imageLayout;
}

export function isSpatialVectorVariable(variable: VariableState): boolean {
    return variable.isFeatureAttribute;
}

export function genSimpleId(prefix: string): string {
    return prefix + Math.floor((1 + Math.random()) * 0x100000000).toString(16) + '-' + Math.floor(Date.now()).toString(16);
}

export function genLayerId() {
    return genSimpleId('layer-');
}

export function isFigureResource(resource: ResourceState | null): boolean {
    return resource && isNumber(resource.id) && resource.dataType.endsWith('.Figure');
}

export function isAnimationResource(resource: ResourceState | null): boolean {
    return resource && isNumber(resource.id) && resource.dataType.endsWith('.HTML');
}

export function isDataFrameResource(resource: ResourceState | null): boolean {
    return resource && (resource.dataType.endsWith('.DataFrame') || resource.dataType.endsWith('.GeoDataFrame'));
}

export function getLayerDisplayName(layer: LayerState): string {
    if (layer.name) {
        return layer.name;
    }
    const varName = (layer as any).varName;
    const resName = (layer as any).resName;
    if (layer.id === AUTO_LAYER_ID) {
        if (resName && varName) {
            return `Selected Variable (${resName} / ${varName})`;
        }
        return `Selected Variable (none)`;
    } else {
        if (resName && varName) {
            return `${resName} / ${varName}`;
        }
    }
    return layer.id;
}

export function getLayerTypeIconName(layer: LayerState): string {
    if (isVectorLayer(layer)) {
        return "pt-icon-map-marker";
    } else if (layer.type === "Image" || layer.type === "VariableImage") {
        return "pt-icon-layout-grid"; // "pt-icon-helper-management" also good
    }
    return "pt-icon-layer";
}

export function findResource(resources: ResourceState[], ref: ResourceRefState): ResourceState | null {
    return findResourceById(resources, ref.resId);
}

export function findResourceByName(resources: ResourceState[], name: string): ResourceState | null {
    return resources.find(r => r.name === name);
}

export function findResourceById(resources: ResourceState[], id: number): ResourceState | null {
    return resources.find(r => r.id === id);
}

export function findVariable(resources: ResourceState[], ref: VariableRefState): VariableState | null {
    const resource = findResource(resources, ref);
    return resource && resource.variables && resource.variables.find(v => v.name === ref.varName);
}

export function findOperation(operations: OperationState[], name: string): OperationState | null {
    return operations && operations.find(op => op.qualifiedName === name || op.name === name);
}

export function findVariableIndexCoordinates(resources: ResourceState[], ref: VariableDataRefState): any[] {
    const resource = findResourceById(resources, ref.resId);
    if (!resource) {
        return EMPTY_ARRAY;
    }
    const coordVariables = resource.coordVariables;
    if (!coordVariables) {
        return EMPTY_ARRAY;
    }
    const variable = resource && resource.variables.find(v => v.name === ref.varName);
    if (!variable) {
        return EMPTY_ARRAY;
    }
    const varIndex = ref.varIndex;
    if (!varIndex || !varIndex.length) {
        return EMPTY_ARRAY;
    }
    const dimNames = variable.dimNames;
    if (!dimNames || !dimNames.length) {
        return EMPTY_ARRAY;
    }

    const coordDataMap = {};
    coordVariables.forEach(cv => {
        coordDataMap[cv.name] = cv.data;
    });

    let coords = [];
    for (let i = 0; i < varIndex.length; i++) {
        const coordIndex = varIndex[i];
        const dimName = i < dimNames.length ? dimNames[i] : null;
        let coord;
        if (dimName) {
            const coordData = coordDataMap[dimName];
            if (coordData && coordData.length && coordIndex < coordData.length) {
                coord = coordData[coordIndex];
            } else {
                coord = '-';
            }
        } else {
            coord = '?';
        }
        coords.push([dimName, coord]);
    }
    return coords;
}

export function getNonSpatialIndexers(resource: ResourceState, ref: VariableDataRefState): DimSizes {
    const coordVariables = resource.coordVariables;
    if (!coordVariables) {
        return EMPTY_OBJECT;
    }
    const variable = resource && resource.variables.find(v => v.name === ref.varName);
    if (!variable) {
        return EMPTY_OBJECT;
    }
    const varIndex = ref.varIndex;
    if (!varIndex || !varIndex.length) {
        return EMPTY_OBJECT;
    }
    const dimNames = variable.dimNames;
    if (!dimNames || !dimNames.length) {
        return EMPTY_OBJECT;
    }

    const coordDataMap = {};
    coordVariables.forEach(cv => {
        coordDataMap[cv.name] = cv.data;
    });

    let dimIndexers = {};
    for (let i = 0; i < varIndex.length; i++) {
        const coordIndex = varIndex[i];
        const dimName = i < dimNames.length ? dimNames[i] : null;
        if (dimName) {
            const coordData = coordDataMap[dimName];
            if (coordData && coordData.length && coordIndex < coordData.length) {
                dimIndexers[dimName] = coordData[coordIndex];
            }
        }
    }
    return dimIndexers;
}

function newInitialWorldViewData(): WorldViewDataState {
    return {
        viewMode: "3D",
        projectionCode: 'EPSG:4326',
        layers: [
            {...AUTO_LAYER},
            {...COUNTRIES_LAYER},
            {...MY_PLACES_LAYER},
        ],
        selectedLayerId: AUTO_LAYER_ID,
        layerSplitPosition: 0.5,
    } as WorldViewDataState;
}

function newInitialFigureViewData(resourceId: number): FigureViewDataState {
    return {
        resourceId: resourceId,
        fixedSize: false,
    };
}

function newInitialAnimationViewData(resourceId: number): AnimationViewDataState {
    return {
        resourceId: resourceId,
        fixedSize: false,
    };
}

function newInitialTableViewData(resName: string, varName: string): TableViewDataState {
    return {resName, varName, dataRows: null};
}

let WORLD_VIEW_COUNTER = 0;

export function newWorldView(): ViewState<WorldViewDataState> {
    const viewNumber = ++WORLD_VIEW_COUNTER;
    return {
        title: `World (${viewNumber})`,
        id: genSimpleId('world-'),
        type: 'world',
        icon: "pt-icon-globe",
        data: newInitialWorldViewData(),
    };
}


export function newFigureView(resource: ResourceState): ViewState<FigureViewDataState> {
    return {
        title: getFigureViewTitle(resource.name),
        id: `fig-${resource.id}`,
        type: 'figure',
        icon: "pt-icon-timeline-area-chart",
        data: newInitialFigureViewData(resource.id),
    };
}

export function getFigureViewTitle(resourceName: string): string {
    return `Figure - ${resourceName}`;
}

export function newAnimationView(resource: ResourceState): ViewState<AnimationViewDataState> {
    return {
        title: getAnimationViewTitle(resource.name),
        id: `anim-${resource.id}`,
        type: 'animation',
        icon: "pt-icon-play",
        data: newInitialAnimationViewData(resource.id),
    };
}

export function getAnimationViewTitle(resourceName: string): string {
    return `Animation - ${resourceName}`;
}

export function newTableView(resName: string, varName: string): ViewState<TableViewDataState> {
    return {
        title: varName ? `${resName}.${varName}` : resName,
        id: genSimpleId('table-'),
        type: 'table',
        icon: "pt-icon-th",
        data: newInitialTableViewData(resName, varName),
    };
}

/**
 * An object that is used by CesiumGlobe to store the Cesium.Viewer instances.
 * It can't be a part of our global state object.
 */
export const EXTERNAL_OBJECT_STORE = {id: "global_external_object_store"};

function getWorldViewExternalObject(view: ViewState<any>): any {
    if (view && view.type === 'world') {
        return EXTERNAL_OBJECT_STORE["CesiumGlobe-" + view.id];
    }
}

export function getWorldViewViewer(view: ViewState<any>): Cesium.Viewer | null {
    const externalObject = getWorldViewExternalObject(view);
    if (externalObject) {
        return externalObject.object as Cesium.Viewer;
    }
    return null;
}

export function getWorldViewSelectedEntity(view: ViewState<any>): Cesium.Entity | null {
    const viewer = getWorldViewViewer(view);
    if (viewer && viewer.selectedEntity) {
        return viewer.selectedEntity;
    }
    return null;
}

export function getWorldViewVectorLayerForEntity(view: ViewState<any>, entity: Cesium.Entity | null): VectorLayerBase | null {
    const externalObject = getWorldViewExternalObject(view);
    if (!entity || !externalObject) {
        return null;
    }

    const viewer = externalObject.object as Cesium.Viewer;
    assert.ok(viewer);

    const dataSourceMap = externalObject.state.dataSourceMap;
    assert.ok(dataSourceMap);

    const dataSourceCollection = viewer.dataSources;
    // Find entity in viewer's dataSourceCollection
    for (let index = 0; index < dataSourceCollection.length; index++) {
        const dataSource: Cesium.DataSource = dataSourceCollection.get(index);
        if (dataSource.entities.contains(entity)) {
            // Find dataSource in dataSourceMap of CesiumGlobe --> layerId
            for (let layerId of Object.getOwnPropertyNames(dataSourceMap)) {
                if (dataSource === dataSourceMap[layerId]) {
                    // Find layer for layerId in views's layer list
                    for (let layer of view.data.layers) {
                        if (layer.id === layerId) {
                            assert.ok(isVectorLayer(layer));
                            return layer;
                        }
                    }

                }
            }
        }
    }

    return null;
}

export function getWorldViewSelectedGeometryWKTGetter(view: ViewState<any>): GeometryWKTGetter {
    const selectedEntity = getWorldViewSelectedEntity(view);
    if (selectedEntity) {
        return () => entityToGeometryWkt(selectedEntity);
    }
    return null;
}

export function isVectorLayer(layer: LayerState) {
    return layer.type === "Vector" || layer.type === "ResourceVector";
}

export function isImageLayer(layer: LayerState) {
    return layer.type === "Image" || layer.type === "VariableImage";
}


const STROKE_COLORS = [
    "#550000",
    "#005500",
    "#000055",
    "#555555",
];

const FILL_COLORS = [
    "#FF0000",
    "#FFA500",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#FF00FF",
    "#00FFFF",
];

export function newVariableLayer(resource: ResourceState,
                                 variable: VariableState,
                                 savedLayers?: { [name: string]: LayerState }): LayerState {
    assert.ok(resource);
    assert.ok(variable);
    const spatialImageVariable = variable && isSpatialImageVariable(variable);
    const spatialVectorVariable = variable && isSpatialVectorVariable(variable);
    assert.ok(spatialImageVariable || spatialVectorVariable, 'geo-spatial variable expected');
    if (spatialImageVariable) {
        const restoredLayer = (savedLayers && savedLayers[variable.name]) as VariableImageLayerState;
        const layerDisplayProperties = updateVariableLayerVarIndex(variable, restoredLayer);
        return {
            ...restoredLayer,
            id: genLayerId(),
            type: 'VariableImage',
            name: `${resource.name}.${variable.name}`,
            visible: true,
            resId: resource.id,
            resName: resource.name,
            varName: variable.name,
            ...layerDisplayProperties
        } as VariableImageLayerState;
    } else {
        const restoredLayer = (savedLayers && savedLayers[variable.name]) as ResourceVectorLayerState;
        const restoredStyle = restoredLayer && restoredLayer.style;
        return {
            ...restoredLayer,
            id: genLayerId(),
            type: 'ResourceVector',
            name: `${resource.name}`,
            visible: true,
            resId: resource.id,
            resName: resource.name,
            style: getResourceVectorStyle(resource.id, restoredStyle)
        } as ResourceVectorLayerState;
    }
}

export function updateAutoLayer(layer: LayerState,
                                resource: ResourceState,
                                variable: VariableState,
                                savedLayers?: SavedLayers): LayerState {
    assert.ok(layer);
    assert.ok(layer.id === AUTO_LAYER_ID);
    const spatialImageVariable = variable && isSpatialImageVariable(variable);
    const spatialVectorVariable = variable && isSpatialVectorVariable(variable);
    if (spatialImageVariable) {
        const restoredLayer = (savedLayers && savedLayers[variable.name]) as VariableImageLayerState;
        const layerDisplayProperties = updateVariableLayerVarIndex(variable, restoredLayer);
        return {
            ...layer,
            ...restoredLayer,
            type: 'VariableImage',
            name: `Auto ${resource.name}.${variable.name}`,
            resId: resource.id,
            resName: resource.name,
            varName: variable.name,
            ...layerDisplayProperties,
            id: AUTO_LAYER_ID,
        };
    } else if (spatialVectorVariable) {
        const restoredLayer = (savedLayers && savedLayers[resource.name]) as ResourceVectorLayerState;
        const restoredStyle = restoredLayer && restoredLayer.style;
        return {
            ...layer,
            ...restoredLayer,
            type: 'ResourceVector',
            name: `Auto ${resource.name}`,
            resId: resource.id,
            resName: resource.name,
            style: getResourceVectorStyle(resource.id, restoredStyle),
            id: AUTO_LAYER_ID,
        } as ResourceVectorLayerState;
    } else {
        return {
            type: 'Unknown' as any,
            name: variable ? `Auto ${variable.name} (geo-ref not found or recognized)` : 'Auto (no selection)',
            visible: layer.visible,
            id: AUTO_LAYER_ID,
        } as any;
    }
}

function getResourceVectorStyle(resourceId: number, restoredStyle: SimpleStyle) {
    return {
        ...SIMPLE_STYLE_DEFAULTS,
        stroke: STROKE_COLORS[resourceId % STROKE_COLORS.length],
        fill: FILL_COLORS[resourceId % FILL_COLORS.length],
        ...restoredStyle,
    };
}

export function getLockForLoadDataSources(dataStoreId: string) {
    return `loadDataSources("${dataStoreId}")`;
}

export function getLockForGetWorkspaceVariableStatistics(resName: string, varName: string, varIndex?: number[]) {
    return getVariableLock('getWorkspaceVariableStatistics', resName, varName, varIndex);
}

function getVariableLock(op: string, resName: string, varName: string, varIndex: number[]) {
    if (varIndex && varIndex.length) {
        return `${op}("${resName}", "${varName}", [${varIndex}])`;
    } else {
        return `${op}("${resName}", "${varName}")`;
    }
}

/**
 * If there is a restoredLayer try reusing its varIndex, otherwise generate new variable display properties with
 * new varIndex.
 *
 * @param variable
 * @param restoredLayer
 * @returns {{varIndex: any}}
 */
function updateVariableLayerVarIndex(variable: VariableState | null,
                                     restoredLayer: VariableImageLayerState | null) {
    let layerDisplayProperties;
    let varIndex;
    if (restoredLayer) {
        varIndex = restoredLayer.varIndex && restoredLayer.varIndex.slice();
    } else if (variable) {
        layerDisplayProperties = newVariableLayerDisplayProperties(variable);
    }
    if (variable) {
        varIndex = newVarIndex(variable, varIndex);
    }
    return {...layerDisplayProperties, varIndex};
}

function newVarIndex(variable: VariableState, varIndex) {
    const numSpatialDims = 2;
    if (variable.numDims
        && variable.numDims >= numSpatialDims
        && (!varIndex || varIndex.length !== variable.numDims - numSpatialDims)) {
        return Array(variable.numDims - numSpatialDims).fill(0);
    }
    return varIndex;
}


function newVariableLayerDisplayProperties(variable: VariableState) {
    const defaultColorMapName = 'inferno';
    const defaultDisplayMin = isNumber(variable.validMin) ? variable.validMin : 0.;
    const defaultDisplayMax = isNumber(variable.validMax) ? variable.validMax : defaultDisplayMin + 1.;
    return {
        colorMapName: isString(variable.colorMapName) ? variable.colorMapName : defaultColorMapName,
        displayMin: isNumber(variable.displayMin) ? variable.displayMin : defaultDisplayMin,
        displayMax: isNumber(variable.displayMax) ? variable.displayMax : defaultDisplayMax,
        alphaBlending: false,
        opacity: 1.0,
        brightness: 1.0,
        contrast: 1.0,
        hue: 0.0,
        saturation: 1.0,
        gamma: 1.0,
        splitMode: SPLIT_MODE_OFF,
    };
}

let _hasWebGL = null;

// from https://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support
export function hasWebGL(): boolean {
    let canvas;
    let context;
    let extensions;

    if (_hasWebGL === null) {
        try {
            canvas = document.createElement('canvas');
            _hasWebGL = true;
            context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            extensions = context.getSupportedExtensions();
            console.log("WebGL supported extensions:", extensions);
        } catch (e) {
            _hasWebGL = false;
            console.warn("WebGL not supported but required by world view");
            return false;
        }
    }

    canvas = null;
    context = null;
    return _hasWebGL;
}


export function getPlacemarkTitleAndIndex(placemark: Placemark, placemarks: PlacemarkCollection): { title: string | undefined, index: number | undefined } {
    const type = placemark.geometry.type;
    const features = placemarks.features;
    const titles = new Set<string>();
    for (let f of features) {
        const props = f.properties;
        if (props && props.title && props.title.startsWith(type)) {
            titles.add(props.title);
        }
    }
    let title, index, t;
    for (index = 1; index <= features.length + 1; index++) {
        t = `${type} ${index}`;
        if (!titles.has(t)) {
            title = t;
            break;
        }
    }
    return {title, index};
}
