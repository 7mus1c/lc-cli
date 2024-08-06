/*
 * @Description: 获取模板地址路径
 * @Version: 1.0
 * @Autor: Li Cheng
 * @Date: 2024-08-06 23:22:07
 * @LastEditors: Li Cheng
 * @LastEditTime: 2024-08-07 00:08:59
 */
import https from "https";

export const getTemplateUrl = async (username) => {
  return new Promise((resolve, reject) => {
    https
      .get(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            "User-Agent": username,
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            const list = JSON.parse(data);
            resolve(
              list.map((item) => {
                return {
                  name: item.name,
                  value: `https://github.com:${username}/${item.name}`,
                };
              })
            );
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
};
