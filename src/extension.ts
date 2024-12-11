import * as vscode from "vscode";

export class OutlineProvider
    implements vscode.TreeDataProvider<any> {
    constructor(private outline: any) {
        console.log(outline);
    }

    getTreeItem(item: any): vscode.TreeItem {
        return new vscode.TreeItem(
            item.label,
            item.children.length > 0
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
    }

    getChildren(element?: any): Thenable<[]> {
        if (element) {
            return Promise.resolve(element.children);
        } else {
            return Promise.resolve(this.outline);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "outliner.outline",
        async () => {
            vscode.window.registerTreeDataProvider(
                "documentOutline",
                new OutlineProvider([dataObject])
            );
        }
    );
    context.subscriptions.push(disposable);
}

const dataObject = {
    label: "level one",
    children: [
        {
            label: "level two a",
            children: [
                {
                    label: "level three",
                    children: [],
                },
            ],
        },
        {
            label: "level two b",
            children: [],
        },
    ],
}