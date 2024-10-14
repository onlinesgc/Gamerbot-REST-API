import { createCanvas, Image, loadImage, registerFont } from "canvas";
import { fetch_guild_config } from "../models/guild_schema";
import path from "path";
/**
 * generates a frame for player
 * @param guild_id
 */
export async function generateFrame(
    name: string,
    frame: number,
    hex_color: string,
    level: string,
    xpPercentage: number,
    member_avatar_url: string,
    guild_id: string = "516605157795037185",
) {
    const guild_config = await fetch_guild_config(guild_id);

    if (guild_config == null) return null;
    if (guild_config.frameConfig == null) return null;

    //eslint-disable-next-line
    const frame_config = guild_config.frameConfig as unknown as Array<any>;
    const frame_path = path.resolve("./") + "/" + frame_config[frame].path;
    if (frame_path == undefined) return null;
    const foreground_frame_path =
        frame_config[frame].foregroundPath != undefined
            ? frame_config[frame].foregroundPath
            : null;

    const whidth = 500;
    const height = 800;

    //INFO: Don't work on windows
    registerFont(path.resolve("./") + "/graphics/fonts/Sansumu02-Regular.ttf", {
        family: "Sansumu 02",
    });

    const canvas = createCanvas(whidth, height);
    const ctx = canvas.getContext("2d");

    //background color
    ctx.fillStyle = hex_color;
    ctx.fillRect(0, 0, whidth, height);
    //Loads frame
    console.log(frame_path);
    await loadImage(frame_path).then((img: Image) =>
        ctx.drawImage(img, 0, 0, whidth, height),
    );

    //loads avatar
    if (member_avatar_url != null) {
        await loadImage(member_avatar_url).then((img: Image) =>
            ctx.drawImage(img, whidth / 2 - 125, 80, 250, 250),
        );
    }

    //writes name
    ctx.font = "50pt Sansumu 02";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(name, whidth / 2, 400);

    //writes level
    ctx.font = "40pt Sansumu 02";
    ctx.fillText(`Level: ${level}`, whidth / 2, 470);

    //renders xp bar
    const multipler = 3.5;
    const fild_bar = 100 * multipler + 10;
    const bar = xpPercentage * multipler + 10;
    ctx.fillStyle = "#898C87";
    roundRect(ctx, 65, 500, fild_bar, 40, 20, true, false);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 65, 500, bar, 40, 20, true, false);

    //writes xp amount
    ctx.font = "40pt Sansumu 02";
    ctx.fillText(`${xpPercentage}%`, whidth / 2, 600);

    //loads foreground frame if there is one
    if (foreground_frame_path != null) {
        await loadImage(foreground_frame_path).then((img: Image) =>
            ctx.drawImage(img, 0, 0, whidth, height),
        );
    }

    //returns the image
    return canvas.toBuffer("image/png");
}
// soruce : https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas/68359160#68359160
function roundRect(
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
) {
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
}
