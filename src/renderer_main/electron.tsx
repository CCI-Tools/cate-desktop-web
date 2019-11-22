
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
