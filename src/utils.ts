import { BaseData, Data, FileData } from './types.d';
import handlebars from 'handlebars';
import path from 'path';

type HandlebarsCompileOptions = Parameters<typeof handlebars.compile> extends [input: unknown, options?: infer T] ? T : never;

export const buildBaseData = (): BaseData => ({
  env: { ...process.env },
  github: {
    action: process.env['GITHUB_ACTION'],
    actor: process.env['GITHUB_ACTOR'],
    api_url: process.env['GITHUB_API_URL'],
    base_ref: process.env['GITHUB_BASE_REF'],
    event_name: process.env['GITHUB_EVENT_NAME'],
    event_path: process.env['GITHUB_EVENT_PATH'],
    graphql_url: process.env['GITHUB_GRAPHQL_URL'],
    head_ref: process.env['GITHUB_HEAD_REF'],
    ref: process.env['GITHUB_REF'],
    repository: process.env['GITHUB_REPOSITORY'],
    repository_name: process.env['GITHUB_REPOSITORY']?.replace(/.*\//, ''),
    run_id: process.env['GITHUB_RUN_ID'],
    run_number: process.env['GITHUB_RUN_NUMBER'],
    server_url: process.env['GITHUB_SERVER_URL'],
    sha: process.env['GITHUB_SHA'],
    workflow: process.env['GITHUB_WORKFLOW'],
    workspace: process.env['GITHUB_WORKSPACE'],
  },
});

export const buildFileData = (filename: string): FileData => ({
  ...path.parse(filename),
  path: filename,
});

export const buildTemplate = <T = Data>(template: string, options?: HandlebarsCompileOptions): handlebars.TemplateDelegate<T> => handlebars.compile<T>(template, options);
