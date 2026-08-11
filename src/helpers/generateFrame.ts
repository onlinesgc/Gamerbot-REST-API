process.env.FONTCONFIG_PATH = "/dev/null";
import { createCanvas, Image, loadImage, registerFont } from "canvas";
import path from "path";
import { fetchGuildConfig } from "../models/guildSchema";
import fs from "fs";

export const generateFrame = async (
    name: string,
    frame: number,
    hexColor: string,
    level: string,
    xpPercentage: number,
    memberAvatar: string | null,
    guildId = "516605157795037185",
) => {
    const guildConfig = await fetchGuildConfig(guildId);
    if (!guildConfig?.frames) return;

    const frames = guildConfig.frames;

    const frameData = frames[frame];

    if (!frameData) return null;

    const framePath = path.resolve("./" + frameData.path) || null;
    if (!framePath) return null;
    const foregroundFramePath = frameData.foregroundPath || null;

    const width = 500;
    const height = 800;

    //INFO: Don't work on windows
    const fontPath = path.resolve("./graphics/fonts/Sansumu02-Regular.ttf");
    registerFont(fontPath, {
        family: "Sansumu",
    });

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    //background color
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, width, height);

    const bgImg = await safeLoadImage(framePath);
    if (bgImg) ctx.drawImage(bgImg, 0, 0, width, height);

    //loads avatar
    if (memberAvatar) {
        const pngAvatar = memberAvatar.replace(/\.webp(\?.*)?$/, ".png$1");
        const avatarImg = await safeLoadImage(pngAvatar);
        if (avatarImg) {
            ctx.drawImage(avatarImg, width / 2 - 125, 80, 250, 250);
        }
    }

    const fallbackFont = '"Sansumu", "Arial"';

    //writes name
    ctx.font = `50pt ${fallbackFont}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(name, width / 2, 400);

    //writes level
    ctx.font = `40pt ${fallbackFont}`;
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
    ctx.font = `40pt ${fallbackFont}`;
    ctx.fillText(`${xpPercentage}%`, width / 2, 600);

    //loads foreground frame if there is one
    if (foregroundFramePath != null) {
        const fgImg = await safeLoadImage(foregroundFramePath);
        if (fgImg) ctx.drawImage(fgImg, 0, 0, width, height);
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

const safeLoadImage = async (source: string): Promise<Image | null> => {
    try {
        // If it's a URL (Avatar or hosted frame)
        if (source.startsWith("http://") || source.startsWith("https://")) {
            const response = await fetch(source);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return await loadImage(Buffer.from(arrayBuffer));
        }

        // If it's a local file path
        if (fs.existsSync(source)) {
            const fileBuffer = fs.readFileSync(source);
            return await loadImage(fileBuffer);
        }

        return null;
    } catch (error) {
        console.error(`Failed to load image from ${source}:`, error);
        return null;
    }
};
