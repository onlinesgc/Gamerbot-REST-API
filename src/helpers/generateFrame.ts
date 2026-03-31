import { createCanvas, Image, loadImage, registerFont } from "canvas";
import path from "path";
import { fetchGuildConfig } from "../models/guildSchema";
import fs from "fs";
import { randomInt } from "crypto";

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

    const framePath = path.resolve("./graphics/FranceFrame.jpg");

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

    const fileBuffer = fs.readFileSync(framePath);
    if (!fileBuffer) return null;

    //Loads frame
    await loadImage(fileBuffer).then((img: Image) =>
        ctx.drawImage(img, 0, 0, width, height),
    );

    //loads avatar
    if (memberAvatar) {
        const pngAvatar = memberAvatar.replace(/\.webp(\?.*)?$/, ".png$1");
        await loadImage(pngAvatar).then((img: Image) =>
            ctx.drawImage(img, width / 2 - 125, 80, 250, 250),
        );

        const hat = fs.readFileSync(path.resolve("./graphics/hat.png"));
        await loadImage(hat).then((img: Image) =>
            ctx.drawImage(img, width / 2 - 125, 65, 250, 250 / 2),
        );
    }

    //renders xp bar

    const baguette = fs.readFileSync(path.resolve("./graphics/baguette.png"));

    for (let i = 0; i < parseInt(level); i++) {
        await loadImage(baguette).then((img: Image) => {
            const randomAngle = Math.random() * 2 * Math.PI;
            const x = randomInt(width - 1);
            const y = randomInt(470, height - 1);
            const size = 60;

            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(randomAngle);
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
        });
    }

    //writes name
    ctx.fillStyle = "#000000";
    ctx.font = "35pt Sansumu";
    ctx.textAlign = "center";
    ctx.fillText(frenchifyName(name), width / 2, 400);

    //writes level
    ctx.font = "40pt Sansumu";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Niveau de baguette:`, width / 2, 470);

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

function frenchifyName(name: string): string {
    let frenchified = name.trim();
    frenchified = frenchified.replace(/th/g, "z").replace(/Th/g, "Z");

    if (frenchified.toLowerCase().startsWith("h")) {
        frenchified = "'" + frenchified.slice(1);
    }

    const lastChar = frenchified.slice(-1).toLowerCase();

    if (lastChar === "o") {
        frenchified = frenchified.slice(0, -1) + "eau";
    } else if (lastChar === "y" || lastChar === "i") {
        frenchified = frenchified.slice(0, -1) + "ois";
    } else if (lastChar === "a") {
        frenchified = frenchified.slice(0, -1) + "ique";
    } else {
        frenchified = frenchified + "ette";
    }

    const startsWithVowelOrApostrophe = /^['aeiouy]/i.test(frenchified);

    let prefix = "";
    if (startsWithVowelOrApostrophe) {
        prefix = Math.random() > 0.5 ? "L'" : "Jean-";
    } else {
        prefix = Math.random() > 0.5 ? "Le " : "Jean-";
    }

    if (prefix === "L'") {
        frenchified =
            frenchified.charAt(1).toUpperCase() + frenchified.slice(2);
    } else if (frenchified.startsWith("'")) {
        frenchified =
            "'" + frenchified.charAt(1).toLowerCase() + frenchified.slice(2);
    }

    return `${prefix}${frenchified}`;
}
