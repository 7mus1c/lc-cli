#! /usr/bin/env node
/*
 * @Description: lic-cli 1.执行 create 2.选择框架 3.下载模板 4.进入项目目录 5.安装依赖
 * @Version: 1.0
 * @Autor: Li Cheng
 * @Date: 2024-08-06 17:55:56
 * @LastEditors: Li Cheng
 * @LastEditTime: 2024-08-12 14:38:04
 */

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import config from "../package.json" assert { type: "json" };
import download from "download-git-repo";
import path from "path";
import ora from "ora";
import fs from "fs-extra";
import { getTemplateUrl } from "../lib/api.js";

const program = new Command();

// 定义创建命令
program
  .command("create <projectName>") // 创建命令
  .option("-t, --template <type>", "指定框架") // 指定框架
  .description("create a new project") // 命令描述
  .action(async (name, options) => {
    let template = options.template;

    // 设置模板放置的路径
    const targetPath = path.resolve(process.cwd(), name);

    // 判断当前路径下是否已经存在同名文件夹
    if (fs.existsSync(targetPath)) {
      // 如果存在同名文件夹，则询问用户是否继续
      const { isContinue } = await inquirer.prompt({
        type: "confirm",
        name: "isContinue",
        message: "当前路径下已经存在同名文件夹，是否继续？",
      });

      // 如果用户选择继续，则删除同名文件夹, 否则退出程序
      isContinue ? fs.removeSync(targetPath) : process.exit(1);
    }

    // 动态获取模板地址
    const repo = await getTemplateUrl("7mus1c");

    // 如果没有传入模板命令就手动选择框架
    if (!template) {
      const { framework } = await inquirer.prompt({
        type: "list",
        name: "framework",
        message: "请选择框架",
        choices: repo,
      });
      template = framework;
    }

    // 定义loading
    const loading = ora("正在下载模版...");
    // 开始loading
    loading.start();

    // 下载项目模板
    download(template, targetPath, function (err) {
      if (err) {
        loading.fail("创建模版失败：" + chalk.red(err.message)); // 失败loading
      } else {
        loading.succeed("创建模版成功!"); // 成功loading
        console.log(chalk.blue(`\n cd ${name}`));
        console.log();
        console.log(chalk.blue("\n npm i"));
        console.log(chalk.blue("\n npm start"));
      }
    });
  });

// 定义帮助命令
program.on("--help", () => {
  console.log(chalk.green("Commands:"));
  console.log();
  console.log(chalk.green("  $ create <projectName> 创建一个新项目"));
  console.log;
});

// 定义当前版本
program
  .version(`${config.version}`, "-v, --version")
  // 说明使用方式
  .usage("<command [option]");

// 解析用户执行命令传入的参数
program.parse(process.argv);
