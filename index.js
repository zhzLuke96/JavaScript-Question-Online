print = (...args) => console.log(...args)
const codeRe = /(\S[\s\S]+)[？?]\s*?```\w+\s*?(\S[\s\S]+?)```\s*?(\S[\s\S]+?)</
const contRe = /([^\n]+)\s*?(\S[\s\S]+)?<details><summary>/
const optRe = /- \w+: /
const mdFileURL = "https://raw.githubusercontent.com/lydiahallie/javascript-questions/master/zh-CN/README-zh_CN.md"

function parseContent(content) {
    let match;
    codeRe.lastIndex = 0
    if (match = codeRe.exec(content)) {
        return {
            title: match[1],
            code: match[2],
            options: match[3].replace(/- (\w+):/g, "<br>$1:").replace(/`([\s\S]+?)`/g, "<b>$1</b>"),
            // options: match[3].split(optRe)
        }
    }
    contRe.lastIndex = 0
    if (match = contRe.exec(content))
        return {
            title: match[1],
            options: match[2].replace(/- (\w+):/g, "<br>$1:").replace(/`([\s\S]+?)`/g, "<b>$1</b>"),
            // options: match[2].split(optRe)
        }
}

async function getQuestions() {
    const quesRe = /###### (\d+)\. ([\s\S]+?)#### 答案: (\w)([\s\S]+?)<\/p>/g
    const res = await (await fetch(mdFileURL)).text()
    let ques = []
    let match;
    while (match = quesRe.exec(res)) {
        ques.push({
            index: match[1],
            content: match[2],
            answer: match[3],
            solution: match[4].replace(/`([\s\S]+?)`/g, "<b>$1</b>")
        })
    }
    return ques.map(v => ({
        ...v,
        ...parseContent(v.content)
    }))
}

function loadQues(que) {
    if (!que) return
    title.innerHTML = que.index + " " + que.title
    code.innerText = (que.code || "").trim()
    options.innerHTML = que.options
    answer.innerHTML = "答案：" + que.answer
    solution.innerHTML = que.solution
    hljs.highlightBlock(code)
}

(async () => {
    const ques = await getQuestions()
    print(ques)
    let index = -1
    let length = ques.length

    function next() {
        anssol.style.cssText = "";
        index += 1
        if (index == length) {
            index = 0
        }
        loadQues(ques[index])
    }

    function pre() {
        anssol.style.cssText = "";
        index = index - 1
        if (index < 0) index = length - 1
        loadQues(ques[index])
    }

    function gotoQ(idx) {
        if (!idx) return
        if (isNaN(idx)) return
        index = Number(idx) - 1
        if (index >= length || index < 0) {
            index = 0
        }
        loadQues(ques[index])
    }
    nxtBtn.onclick = () => next()
    upBtn.onclick = () => pre()
    gotoBtn.onclick = () => {
        gotoQ(Number(gotoInp.value))
        gotoInp.value = ""
    }

    next()
})()

hljs.initHighlightingOnLoad();