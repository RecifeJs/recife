import fs from 'fs';
import path from 'path';
import { gql } from 'apollo-server-koa';
import { DocumentNode } from 'graphql';

import Graph from './models/Graph';
import Resolvers from './models/Resolvers';
import Type from './models/Type';
import Input from './models/Input';
import GraphTypeEnum from './models/GraphTypeEnum';
import GraphCompiler from './GraphCompiler';
import TypeCompiler from './TypeCompiler';
import Recife from '../Recife';

class Compiler {
  private graphs: Graph[] = [];
  private types: Type[] = [];
  private inputs: Input[] = [];

  compile() {
    const filesController: string[] = fs.readdirSync(Recife.PATH_CONTROLLERS);
    filesController.forEach(file => {
      const nameFileAbsolute = path.join(Recife.PATH_CONTROLLERS, file);

      const graphCompiler = new GraphCompiler(nameFileAbsolute);
      graphCompiler.compile();
      this.graphs = this.graphs.concat(graphCompiler.getGraphs());
      this.inputs = this.inputs.concat(graphCompiler.getInputs());
    });

    const filesModel: string[] = fs.readdirSync(Recife.PATH_MODELS);
    filesModel.forEach(file => {
      const nameFileAbsolute = path.join(Recife.PATH_MODELS, file);

      const typeCompiler = new TypeCompiler(nameFileAbsolute);
      typeCompiler.compile();
      this.types.push(typeCompiler.getType());
    });
  }

  generateType(): DocumentNode {
    let typeString = '';

    this.types.forEach(type => {
      typeString += `type ${type.name} {\n`;

      type.fields.forEach(field => {
        typeString += `  ${field.name}: ${field.type} \n`;
      });

      typeString += '}\n';
    });

    this.inputs.forEach(input => {
      typeString += `input ${input.name} {\n`;

      input.fields.forEach(field => {
        const required = field.isRequired ? '!' : '';
        typeString += `  ${field.name}: ${field.type}${required} \n`;
      });

      typeString += '}\n';
    });

    typeString += this.generateTypeGraph(GraphTypeEnum.QUERY);
    typeString += this.generateTypeGraph(GraphTypeEnum.MUTATION);
    typeString += this.generateTypeGraph(GraphTypeEnum.SUBSCRIPTION);

    return gql(typeString);
  }

  private generateTypeGraph(graphType: GraphTypeEnum): string {
    let typeString = '';

    this.graphs.forEach(graph => {
      if (graph.type === graphType) {
        if (graph.params) {
          const required = graph.params.isRequired ? '!' : '';
          typeString += `  ${graph.name}(${graph.params.name}: ${graph.params.type}${required}): ${graph.returnType}\n`;
        } else {
          typeString += `  ${graph.name}: ${graph.returnType}\n`;
        }
      }
    });

    if (typeString) {
      return `type ${graphType.toString()} {\n${typeString}}\n`;
    }

    return '';
  }

  generateResolvers(): any {
    let resolvers = new Resolvers();

    this.graphs.forEach(graph => {
      if (graph.type === GraphTypeEnum.QUERY) {
        resolvers.addQuery(graph);
      } else if (graph.type === GraphTypeEnum.MUTATION) {
        resolvers.addMutation(graph);
      } else if (graph.type === GraphTypeEnum.SUBSCRIPTION) {
        resolvers.addSubscription(graph);
      }
    });

    return resolvers.formatter();
  }
}

export default Compiler;
