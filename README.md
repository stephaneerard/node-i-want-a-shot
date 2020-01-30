# About

Take captures of Qwant SERPs from CLI

* Qwant.com API
* Lite Qwant.com Screenshot (JPG, multiple resolutions possible)
* QwantJunior.com API
* Qwant Junior "Education Nationale" API

# Usage

```bash
$ take-a-shot.ts shot --help
take-a-shot.ts shot <query>

take a qwant shot !

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --lite         Take a LITE shot !                    [boolean] [default: true]
  --api          Take an API shot !                    [boolean] [default: true]
  --edu          Take a JUNIOR/EDU shot !              [boolean] [default: true]
  --egp          Take a JUNIOR/EGP shot !              [boolean] [default: true]
  --pages                                                  [number] [default: 4]
  --path                              [string] [default: "C:\Users\steph\tests"]
  --user-agent
    [string] [default: "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail
                                                        Firefox/firefoxversion"]
  --resolutions                                 [array] [default: ["1920x1080"]]
```
