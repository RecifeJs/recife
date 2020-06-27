import * as ts from 'typescript';
import os from 'os';

import Type from './token/Type';
import ImportDeclaration from './token/ImportDeclaration';

class TypeCompiler {
  private types: Type[];
  private imports: ImportDeclaration[] = [];
  private sourceFile: ts.SourceFile | undefined;
  private path: string;
  private folder: string;

  constructor(path: string, program: ts.Program) {
    this.sourceFile = program.getSourceFile(path);
    this.path = path;
    this.types = [];
    this.folder = this.getFolder();
  }

  getTypes() {
    return this.types;
  }

  compile() {
    if (this.sourceFile) {
      let classExportDefault = '';
      ts.forEachChild(this.sourceFile, (node: ts.Node) => {
        if (ts.isExportAssignment(node)) {
          classExportDefault = node.expression.getText(this.sourceFile);
        }
      });

      ts.forEachChild(this.sourceFile, (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          const importDeclaration = new ImportDeclaration(node, this.folder, this.sourceFile);
          this.imports.push(importDeclaration);
        }

        if (ts.isClassDeclaration(node) && node.name) {
          const isExportDefaultExternal = node.name.getText(this.sourceFile) === classExportDefault;

          if (this.isType(node) && (isExportDefaultExternal || this.isExport(node))) {
            this.types.push(new Type(node, this.path, isExportDefaultExternal, this.imports, this.sourceFile));
          }
        }
      });
    }
  }

  private getFolder(): string {
    const bar = os.platform() === 'win32' ? '\\' : '/';
    return this.path.substring(0, this.path.lastIndexOf(bar));
  }

  private isType(node: ts.ClassDeclaration): boolean {
    let isType = false;
    if (node.decorators) {
      node.decorators.map(decorator => {
        decorator.expression.forEachChild((expression: ts.Node) => {
          if (expression.getText(this.sourceFile) === 'Type') {
            isType = true;
          }
        });
      });
    }
    return isType;
  }

  private isExport(node: ts.ClassDeclaration): boolean {
    let isExport = false;

    if (node.modifiers) {
      node.modifiers.forEach(modifier => {
        if (modifier.getText(this.sourceFile) === 'export') {
          isExport = true;
        }
      });
    }

    return isExport;
  }
}

export default TypeCompiler;
