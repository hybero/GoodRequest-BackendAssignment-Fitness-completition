import { Request } from "express"
import fs from 'node:fs'
import path from "node:path"

export const localize = (req: Request, str: string) => {

    const lang = req.headers.localization

    const filename = `localization_${lang}.json`
    const fileContents = fs.readFileSync(path.join(__dirname, '..', 'files', filename), { encoding: 'utf-8' })
    const localizationsJson = JSON.parse(fileContents)
    const localizedString = localizationsJson[str]

    return localizedString
}