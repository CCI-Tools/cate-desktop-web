
class IpcRenderer {

    send(channel: string, options: any, b: boolean) {
        console.warn("IpcRenderer.send() not implemented");
        // TODO: implement me.
    }

    once(channel: string, listener: (event: any, param1?: any, param2?: any, param3?: any) => void) {
        console.warn("IpcRenderer.once() not implemented");
        // TODO: implement me.
    }

    sendSync(channel: string, options: any, b: boolean) {
        console.warn("IpcRenderer.sendSync() not implemented");
        // TODO: implement me.
    }
}


class Shell {
    openExternal(path: string): boolean {
        // TODO: implement me. may open new browser window using path
        console.warn("Shell.openExternal() not implemented");
        return false;
    }

    showItemInFolder(path: string): boolean {
        // TODO: implement me. may show workspace file in new browser window
        console.warn("Shell.showItemInFolder() not implemented");
        return false;
    }

    openItem(path: string): boolean {
        // TODO: implement me. No idea here...
        console.warn("Shell.openItem() not implemented");
        return false;
    }
}


class Clipboard {
    writeText(text: string) {
        // TODO: implement me. No idea here...
        console.warn("Clipboard.writeText() not implemented");
    }
}

export const ipcRenderer = new IpcRenderer();
export const shell = new Shell();
export const clipboard = new Clipboard();
