import { rename } from "node:fs/promises";
import { resolve } from "node:path";

import rcedit from "rcedit";

import { log } from "../log.js";

/**
 * Windows specific configuration steps
 * https://learn.microsoft.com/en-us/windows/win32/msi/version
 * https://learn.microsoft.com/en-gb/windows/win32/sbscs/application-manifests
 * https://learn.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2015/deployment/trustinfo-element-clickonce-application?view=vs-2015#requestedexecutionlevel
 * https://learn.microsoft.com/en-gb/windows/win32/menurc/versioninfo-resource
 *
 * @param {object} app     Multi platform configuration options
 * @param {string} outDir  The directory to hold build artifacts
 */
const setWinConfig = async (app, outDir) => {
  let versionString = {
    Comments: app.comments,
    CompanyName: app.author,
    FileDescription: app.fileDescription,
    FileVersion: app.fileVersion,
    InternalName: app.name,
    LegalCopyright: app.legalCopyright,
    LegalTrademarks: app.legalTrademark,
    OriginalFilename: app.name,
    PrivateBuild: app.name,
    ProductName: app.name,
    ProductVersion: app.version,
    SpecialBuild: app.name,
  };

  Object.keys(versionString).forEach((option) => {
    if (versionString[option] === undefined) {
      delete versionString[option];
    }
  });

  try {
    const outDirAppExe = resolve(outDir, `${app.name}.exe`);
    await rename(resolve(outDir, "nw.exe"), outDirAppExe);
    await rcedit(outDirAppExe, {
      "file-version": app.version,
      "icon": app.icon,
      "product-version": app.version,
      "version-string": versionString,
    });
  } catch (error) {
    log.warn(
      "Renaming EXE failed or unable to modify EXE. If it's the latter, ensure WINE is installed or build in Windows",
    );
    log.error(error);
  }
};

export { setWinConfig };
