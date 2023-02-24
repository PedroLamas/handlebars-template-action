import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { Config, Data, DataWithOutputFile } from './types.d';
import { buildBaseData, buildFileData, buildTemplate } from './utils';
import fs from 'fs';

const run = async (): Promise<void> => {
  try {
    const config: Config = {
      files: core.getInput('files'),
      outputFilename: core.getInput('output-filename'),
      deleteInputFile: core.getInput('delete-input-file') === 'true',
      htmlEscape: core.getInput('html-escape') === 'true',
      dryRun: core.getInput('dry-run') === 'true',
    };

    core.debug(`Configuration:\n${JSON.stringify(config, undefined, 2)}`);

    const baseData = buildBaseData();

    core.debug(`Base data:\n${JSON.stringify(baseData, undefined, 2)}`);

    const outputFilenameTemplate = buildTemplate(config.outputFilename, { noEscape: true });

    const globber = await glob.create(config.files);

    for await (const inputFilename of globber.globGenerator()) {
      const fileStats = await fs.promises.stat(inputFilename);

      if (!fileStats.isFile) {
        continue;
      }

      core.debug(`Reading input file "${inputFilename}"...`);

      const data: Data = {
        ...baseData,
        file: buildFileData(inputFilename),
      };
      const outputFilename = outputFilenameTemplate(data);

      const inputContent = await fs.promises.readFile(inputFilename, 'utf8');

      const outputContentTemplate = buildTemplate(inputContent, {
        noEscape: !config.htmlEscape,
      });

      const dataWithOutputFile: DataWithOutputFile = {
        ...data,
        outputFile: buildFileData(outputFilename),
      };
      const outputContent = outputContentTemplate(dataWithOutputFile);

      if (config.deleteInputFile) {
        core.debug(`Deleting input file...`);

        if (!config.dryRun) {
          await fs.promises.unlink(inputFilename);
        }
      }

      core.debug(`Writing output file "${outputFilename}"...`);

      if (!config.dryRun) {
        await fs.promises.writeFile(outputFilename, outputContent);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
