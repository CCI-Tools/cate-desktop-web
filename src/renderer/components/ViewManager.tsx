import * as React from 'react';
import {Colors, IconName, Menu, MenuItem, NonIdealState, Popover, Position} from "@blueprintjs/core";
import {Splitter, SplitDir} from "./Splitter";
import {
    isViewSplitState, ViewState, ViewSplitState, ViewPanelState, ViewLayoutState, ViewPath,
    ViewRenderer, findMoveTargetViewIds
} from "./ViewState";
import {CSSProperties} from "react";

/**
 * Mapping from view type name to ViewRenderer
 */
export type ViewRenderMap = { [viewType: string]: ViewRenderer<any> };
/**
 * Mapping from view id to ViewState
 */
export type ViewMap = { [viewId: string]: ViewState<any> };

interface IViewManagerProps {
    viewRenderMap: ViewRenderMap;
    viewLayout: ViewLayoutState;
    views: ViewState<any>[];
    activeView: ViewState<any> | null;
    noViewsDescription?: string | null;
    noViewsAction?: JSX.Element | null;
    noViewsVisual?: IconName | JSX.Element;
    onSelectView: (viewPath: ViewPath, viewId: string) => void;
    onCloseView: (viewPath: ViewPath, viewId: string) => void;
    onCloseAllViews: (viewPath: ViewPath) => void;
    onMoveView: (sourceViewId: string, placement: "before"|"after", targetViewId: string) => void;
    onSplitViewPanel: (viewPath: ViewPath, dir: SplitDir, pos: number) => void;
    onChangeViewSplitPos: (viewPath: ViewPath, delta: number) => void;
}

interface IViewManagerState {
}

export class ViewManager extends React.PureComponent<IViewManagerProps, IViewManagerState> {
    static readonly NO_VIEW_CONTAINER_STYLE = {
        width: "100%",
        height: "100%",
        flex: "auto"
    };
    static readonly HOR_SPLIT_CONTAINER_STYLE = {
        width: "100%",
        height: "100%",
        display: "flex",
        flexFlow: "row nowrap",
        flex: "auto",
        boxSizing: "border-box",
    };
    static readonly VER_SPLIT_CONTAINER_STYLE = {
        width: "100%",
        height: "100%",
        display: "flex",
        flexFlow: "column nowrap",
        flex: "auto",
        boxSizing: "border-box",
    };

    private viewMap: ViewMap;

    constructor(props: IViewManagerProps) {
        super(props);
        this.viewMap = ViewManager.createViewMap(this.props.views);
    }

    componentWillReceiveProps(nextProps: IViewManagerProps): void {
        this.viewMap = ViewManager.createViewMap(nextProps.views);
    }

    static createViewMap(views: ViewState<any>[]) {
        const map = {};
        views.forEach(view => {
            map[view.id] = view;
        });
        return map;
    }

    render() {
        if (!this.props.views.length) {
            return this.renderNoViews();
        }
        if (isViewSplitState(this.props.viewLayout)) {
            return this.renderViewSplit(this.props.viewLayout as ViewSplitState, '');
        } else {
            return this.renderViewPanel(this.props.viewLayout as ViewPanelState, '');
        }
    }

    renderNoViews() {
        return (
            <div style={ViewManager.NO_VIEW_CONTAINER_STYLE}>
                <NonIdealState
                    title="No views"
                    description={this.props.noViewsDescription}
                    action={this.props.noViewsAction}
                    icon={this.props.noViewsVisual}
                />
            </div>
        );
    }

    renderViewSplit(viewSplit: ViewSplitState, viewPath: ViewPath) {

        let renderedLayout1;
        let layout1 = viewSplit.layouts[0];
        if (isViewSplitState(layout1)) {
            renderedLayout1 = this.renderViewSplit(layout1 as ViewSplitState, viewPath + '0');
        } else {
            renderedLayout1 = this.renderViewPanel(layout1 as ViewPanelState, viewPath + '0');
        }

        let renderedLayout2;
        let layout2 = viewSplit.layouts[1];
        if (isViewSplitState(layout2)) {
            renderedLayout2 = this.renderViewSplit(layout2 as ViewSplitState, viewPath + '1');
        } else {
            renderedLayout2 = this.renderViewPanel(layout2 as ViewPanelState, viewPath + '1');
        }

        if (renderedLayout1 && renderedLayout2) {
            let containerStyle;
            let childContainer1Style;
            let childContainer2Style;
            const splitterSize = 4; // px
            if (viewSplit.dir === 'hor') {
                containerStyle = ViewManager.HOR_SPLIT_CONTAINER_STYLE;
                let width1 = viewSplit.pos;
                let width2 = `calc(100% - ${width1 + splitterSize}px)`;
                childContainer1Style = {flex: 'none', width: width1, height: '100%'};
                childContainer2Style = {flex: 'auto', width: width2, height: '100%'};
            } else {
                containerStyle = ViewManager.VER_SPLIT_CONTAINER_STYLE;
                let height1 = viewSplit.pos;
                let height2 = `calc(100% - ${height1 + splitterSize}px)`;
                childContainer1Style = {flex: 'none', width: '100%', height: height1};
                childContainer2Style = {flex: 'auto', width: '100%', height: height2};
            }

            return (
                <div style={containerStyle}>
                    <div style={childContainer1Style}>
                        {renderedLayout1}
                    </div>
                    <Splitter dir={viewSplit.dir}
                              onChange={(delta: number) => this.props.onChangeViewSplitPos(viewPath, delta)}/>
                    <div style={childContainer2Style}>
                        {renderedLayout2}
                    </div>
                </div>
            );
        } else if (renderedLayout1) {
            return renderedLayout1;
        } else if (renderedLayout2) {
            return renderedLayout2;
        }
        return null;
    }

    renderViewPanel(viewPanel: ViewPanelState, viewPath: ViewPath) {
        return (
            <ViewPanel
                viewLayout={this.props.viewLayout}
                viewRenderMap={this.props.viewRenderMap}
                viewMap={this.viewMap}
                activeView={this.props.activeView}
                viewPath={viewPath}
                viewIds={viewPanel.viewIds}
                selectedViewId={viewPanel.selectedViewId}
                onSelectView={this.props.onSelectView}
                onCloseView={this.props.onCloseView}
                onCloseAllViews={this.props.onCloseAllViews}
                onMoveView={this.props.onMoveView}
                onSplitViewPanel={this.props.onSplitViewPanel}
            />
        );
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ViewPanel

interface IViewPanelProps {
    viewLayout: ViewLayoutState;
    viewRenderMap: ViewRenderMap;
    viewMap: ViewMap;
    activeView: ViewState<any> | null;
    viewPath: ViewPath;
    viewIds: string[];
    selectedViewId: string | null;
    onSelectView: (viewPath: ViewPath, viewId: string) => void;
    onCloseView: (viewPath: ViewPath, viewId: string) => void;
    onCloseAllViews: (viewPath: ViewPath) => void;
    onMoveView: (sourceViewId: string, placement: "before"|"after", targetViewId: string) => void;
    onSplitViewPanel: (viewPath: ViewPath, dir: SplitDir, pos: number) => void;
}

class ViewPanel extends React.PureComponent<IViewPanelProps, null> {

    static readonly SELECTED_BG_COLOR = Colors.DARK_GRAY1;
    static readonly TAB_STYLE_SELECTED: CSSProperties = {
        padding: 2,
        flex: "none",
        color: Colors.WHITE,
        backgroundColor: ViewPanel.SELECTED_BG_COLOR
    };
    static readonly TAB_STYLE_NORMAL: CSSProperties = {padding: 2, color: Colors.LIGHT_GRAY1};

    static readonly TITLE_STYLE_BASE: CSSProperties = {paddingLeft: 4, paddingRight: 4};
    static readonly TITLE_STYLE_ACTIVE: CSSProperties = {...ViewPanel.TITLE_STYLE_BASE, color: Colors.BLUE5};
    static readonly TITLE_STYLE_SELECTED: CSSProperties = ViewPanel.TITLE_STYLE_BASE;
    static readonly TITLE_STYLE_NORMAL: CSSProperties = ViewPanel.TITLE_STYLE_BASE;

    static readonly CLOSE_ICON_STYLE_SELECTED: CSSProperties = {marginLeft: 6, fontSize: 12};
    static readonly CLOSE_ICON_STYLE_NORMAL: CSSProperties = {marginLeft: 6, fontSize: 12};

    static readonly MENU_ICON_STYLE: CSSProperties = {color: Colors.GRAY5, marginLeft: 5, fontSize: 12};

    static readonly TABS_STYLE: CSSProperties = {flex: "none", display: "flex", flexDirection: "row"};
    static readonly SPACER_STYLE: CSSProperties = {flex: "auto"};
    static readonly MENU_STYLE: CSSProperties = {flex: "none", height: "100%"};

    static readonly VIEW_HEADER_STYLE: CSSProperties = {
        display: "flex",
        flexDirection: "row",
        flex: "none",
        width: "100%",
        marginTop: 2,
        borderBottomStyle: "solid",
        borderBottomWidth: 2,
        borderBottomColor: ViewPanel.SELECTED_BG_COLOR,
        boxSizing: "border-box",
        overflow: "hidden",
    };

    static readonly VIEW_BODY_STYLE: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        flex: 'auto',
        width: "100%",
        height: "100%",
        overflow: "hidden",
    };

    static readonly CONTAINER_STYLE: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
    };


    private contentElement: HTMLDivElement;

    constructor(props: IViewPanelProps) {
        super(props);
        this.onSplitHor = this.onSplitHor.bind(this);
        this.onSplitVer = this.onSplitVer.bind(this);
        this.onContentDivRef = this.onContentDivRef.bind(this);
    }

    onSplitHor() {
        this.props.onSplitViewPanel(this.props.viewPath, "hor", 0.5 * this.contentElement.clientWidth);
    }

    onSplitVer() {
        this.props.onSplitViewPanel(this.props.viewPath, "ver", 0.5 * this.contentElement.clientHeight);
    }

    onContentDivRef(contentElement: HTMLDivElement) {
        this.contentElement = contentElement;
    }

    render() {
        const viewIds = this.props.viewIds;
        if (!viewIds || !viewIds.length) {
            return null;
        }

        const selectedViewId = this.props.selectedViewId;
        const views = [];
        let selectedView = null;
        viewIds.forEach(id => {
            const view = this.props.viewMap[id];
            if (view) {
                if (selectedViewId && id === selectedViewId) {
                    selectedView = view;
                }
                views.push(view);
            }
        });

        let renderedViewContent;
        const tabItems = [];
        for (let i = 0; i < views.length; i++) {
            let view = views[i];
            let viewId = view.id;
            let viewTitle = view.title;
            let viewIconName = view.icon;
            let tabStyle;
            let titleStyle;
            let closeIconStyle;
            if (selectedView && selectedView.id === viewId) {
                let viewRenderer = this.props.viewRenderMap[view.type];
                renderedViewContent = viewRenderer(view);
                tabStyle = ViewPanel.TAB_STYLE_SELECTED;
                titleStyle = (selectedView === this.props.activeView) ? ViewPanel.TITLE_STYLE_ACTIVE : ViewPanel.TITLE_STYLE_SELECTED;
                closeIconStyle = ViewPanel.CLOSE_ICON_STYLE_SELECTED;
            } else {
                tabStyle = ViewPanel.TAB_STYLE_NORMAL;
                titleStyle = ViewPanel.TITLE_STYLE_NORMAL;
                closeIconStyle = ViewPanel.CLOSE_ICON_STYLE_NORMAL;
            }

            const onClose = () => {
                this.props.onCloseView(this.props.viewPath, viewId);
            };
            const onSelect = () => {
                this.props.onSelectView(this.props.viewPath, viewId);
            };

            let iconSpan;
            if (viewIconName && viewIconName !== '') {
                iconSpan = <span className={"pt-icon-standard " + viewIconName} style={titleStyle} onClick={onSelect}/>;
            }
            tabItems.push(
                <div key={viewId} style={tabStyle}>
                    {iconSpan}
                    <span style={titleStyle} onClick={onSelect}>{viewTitle}</span>
                    <span style={closeIconStyle} className="pt-icon-standard pt-icon-cross" onClick={onClose}/>
                </div>
            );
        }

        const tabs = (<div style={ViewPanel.TABS_STYLE}>{tabItems}</div>);
        const spacer = (<div key="spacer" style={ViewPanel.SPACER_STYLE}/>);

        const menuIconStyle = ViewPanel.MENU_ICON_STYLE;

        let splitHorEntry;
        let splitVerEntry;

        if (views.length > 1) {
            splitHorEntry = (
                <span key="splitHor" style={menuIconStyle} className="pt-icon-standard pt-icon-add-column-right"
                      onClick={this.onSplitHor}/>
            );
            splitVerEntry = (
                <span key="splitVer" style={menuIconStyle} className="pt-icon-standard pt-icon-add-row-bottom"
                      onClick={this.onSplitVer}/>
            );
        }

        let moreMenuEntry;
        if (selectedView) {
            const result = findMoveTargetViewIds(this.props.viewLayout, selectedViewId);
            const viewMap = this.props.viewMap;
            const moveBeforeMenuItems = result.before.map(viewId => {
                const view = viewMap[viewId];
                const onClick = () => this.props.onMoveView(selectedViewId, 'before', view.id);
                return (<MenuItem key={viewId} onClick={onClick} text={view.title}/>);
            });
            const moveAfterMenuItems = result.after.map(viewId => {
                const view = viewMap[viewId];
                const onClick = () => this.props.onMoveView(selectedViewId, 'after', view.id);
                return (<MenuItem key={viewId} onClick={onClick} text={view.title}/>);
            });

            let moveBeforeMenuItem;
            if (moveBeforeMenuItems.length) {
                moveBeforeMenuItem = (
                    <MenuItem key="before" text="Move Before">{moveBeforeMenuItems}</MenuItem>
                );
            }
            let moveAfterMenuItem;
            if (moveAfterMenuItems.length) {
                moveAfterMenuItem = (
                    <MenuItem key="after" text="Move After">{moveAfterMenuItems}</MenuItem>
                );
            }
            if (moveBeforeMenuItem || moveAfterMenuItem) {
                const moreMenu = (<Menu>{moveBeforeMenuItem}{moveAfterMenuItem}</Menu>);
                moreMenuEntry = (
                    <Popover content={moreMenu} position={Position.BOTTOM}>
                        <span key="more" style={menuIconStyle} className="pt-icon-standard pt-icon-more"/>
                    </Popover>
                );
            }
        }

        const menu = (
            <div style={ViewPanel.MENU_STYLE}>
                {splitHorEntry}
                {splitVerEntry}
                {moreMenuEntry}
            </div>
        );

        return (
            <div style={ViewPanel.CONTAINER_STYLE}>
                <div style={ViewPanel.VIEW_HEADER_STYLE}>
                    {tabs}
                    {spacer}
                    {menu}
                </div>
                <div style={ViewPanel.VIEW_BODY_STYLE}
                     ref={this.onContentDivRef}>
                    {renderedViewContent}
                </div>
            </div>
        );
    }
}





