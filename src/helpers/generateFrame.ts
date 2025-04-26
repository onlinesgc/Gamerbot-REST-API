import { createCanvas, Image, loadImage, registerFont } from "canvas";
import path from "path";
import { fetchGuildConfig } from "../models/guild_schema";

export const generateFrame = async (
  name: string,
  frame: number,
  hexColor: string,
  level: string,
  xpPercentage: number,
  memberAvatar: string,
  guildId = "516605157795037185",
) => {
  const guildConfig = await fetchGuildConfig(guildId);
  if (!guildConfig?.frames) return;

  //eslint-disable-next-line
  const frames = guildConfig.frames as unknown as Array<any>;
  const framePath = path.resolve("./") + "/" + frames[frame].path;
  if (framePath == undefined) return null;
  const foregroundFramePath =
    frames[frame].foregroundPath != undefined
      ? frames[frame].foregroundPath
      : null;

  const width = 500;
  const height = 800;

  //INFO: Don't work on windows
  registerFont(path.resolve("./") + "/graphics/fonts/Sansumu02-Regular.ttf", {
    family: "Sansumu 02",
  });

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  //background color
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, width, height);
  //Loads frame
  await loadImage(framePath).then((img: Image) =>
    ctx.drawImage(img, 0, 0, width, height),
  );

  //loads avatar
  if (memberAvatar != null) {
    await loadImage(memberAvatar).then((img: Image) =>
      ctx.drawImage(img, width / 2 - 125, 80, 250, 250),
    );
  }

  //writes name
  ctx.font = "50pt Sansumu 02";
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(name, width / 2, 400);

  //writes level
  ctx.font = "40pt Sansumu 02";
  ctx.fillText(`Level: ${level}`, width / 2, 470);

  //renders xp bar
  const multiplier = 3.5;
  const filledBar = 100 * multiplier + 10;
  const bar = xpPercentage * multiplier + 10;
  ctx.fillStyle = "#898C87";
  roundRect(ctx, 65, 500, filledBar, 40, 20, true, false);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 65, 500, bar, 40, 20, true, false);

  //writes xp amount
  ctx.font = "40pt Sansumu 02";
  ctx.fillText(`${xpPercentage}%`, width / 2, 600);

  //loads foreground frame if there is one
  if (foregroundFramePath != null) {
    await loadImage(foregroundFramePath).then((img: Image) =>
      ctx.drawImage(img, 0, 0, width, height),
    );
  }

  //returns the image
  return canvas.toBuffer("image/png");
};

// source : https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas/68359160#68359160
export const roundRect = (
  //eslint-disable-next-line
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  //eslint-disable-next-line
  radius: any,
  fill: boolean,
  stroke: boolean,
) => {
  if (typeof stroke === "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (const side in defaultRadius) {
      // eslint-disable-next-line
      // @ts-ignore
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height,
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
};
