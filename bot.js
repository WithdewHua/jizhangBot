var TelegramBot = require('node-telegram-bot-api'); // Copyrigth by @miya0v0 
var proxy_url = 'http://127.0.0.1:7890'   //梯子代理端口
var tgToken = '7388212270:AAG8od50m99RvwhJQ8tn9WZhIPImM7xjg-A'
var { pool, request, caozuoshouce, evaluateExpression } = require('./utils')

var bot = new TelegramBot(tgToken, {
    polling: true,
    request: {   //代理   部署时不需要
        proxy: proxy_url,
    }
});

const keyboard = [
    [{ text: '🚀开始使用' }, { text: "📕使用说明" }],
    [{ text: "🏦U兑TRX", url: 'https://t.me/+4Cf_vjvu-qE1ZDll' }]
]
bot.getMe().then(res => {
    console.log(res);
})
bot.on('message', async (msg) => {
    console.log(msg, '\n--------message');
    const { text } = msg
    const { id: userid, first_name, last_name, username } = msg.from
    const { id: chatid, type } = msg.chat
    const { new_chat_participant, left_chat_participant } = msg
    if (new_chat_participant && (type == 'group' || type == 'supergroup')) { //被拉入群
        bot.getMe().then(async res => {
            if (new_chat_participant.id == res.id) {
                await onInvite({ chatid, inviterId: userid })
                bot.sendMessage(
                    chatid,
                    `🙋大家好,我是<b>明月支付记账机器人</b>\n😊感谢把我加入贵群！\n💱请邀请人先输入开始进行初始化。`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[{ text: '开始', callback_data: "开始" }]]
                        },
                    }
                )
            }
        })
    } else if (left_chat_participant && (type == 'group' || type == 'supergroup')) { //被移除群
        // leaveGroup(chatid)
    }
})

bot.on('text', async (msg) => {
    console.log(msg, '\n--------msgText');
    const { text, message_id } = msg
    const { id: userid, first_name, last_name, username } = msg.from
    const { id: chatid, type, title } = msg.chat
    if (type == 'group' || type == 'supergroup') {  //群消息
        if (text == '开始') {
            await isInvite({ chatid, userid })
            kaishi(chatid)
        } else if (text.includes('设置汇率')) {
            await isCozuoren(chatid, userid)
            shezhihuilv(chatid, text.split('设置汇率')[1])
        } else if (text == '查询汇率') {
            const huilv = await getHuilv(chatid)
            bot.sendMessage(chatid, `当前的汇率为 ${huilv}`)
        } else if (text.includes('添加操作人 @')) {
            await isInvite({ chatid, userid })
            caozuoren(msg, '添加')
        } else if (text.includes('移除操作人 @')) {
            await isInvite({ chatid, userid })
            caozuoren(msg, '移除')
        } else if (text == '+0') {
            const status = await getGroupStatus(chatid)
            if (status == 1) {
                jinrizhangdan(Math.abs(chatid))
            }
        } else if (text == '-0') {
            const status = await getGroupStatus(chatid)
            if (status == 1) {
                jinrizhangdan(Math.abs(chatid), 1)
            }
        } else if (/^\+[0-9]*\.?[0-9]+$/.test(text) || /^\-[0-9]*\.?[0-9]+$/.test(text)) {
            await isCozuoren(chatid, userid)
            const status = await getGroupStatus(chatid)
            if (status == 1) {
                jizhang(msg)
            }
        } else if (text.includes('下发')) {
            await isCozuoren(chatid, userid)
            const status = await getGroupStatus(chatid)
            if (status == 1) {
                jizhang(msg, 1)
            }
        } else if (/^账单(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(text)) {
            const status = await getGroupStatus(chatid)
            if (status == 1) {
                const date = text.split('账单')[1]
                jinrizhangdan(Math.abs(chatid), 3, date)
            }
        } else if (text == "z0") {
            huilv(msg)
        } else if (text == '关闭计算') {
            await isCozuoren(chatid, userid)
            jisuangongneng(chatid, 0)
        } else if (text == '开启计算') {
            await isCozuoren(chatid, userid)
            jisuangongneng(chatid, 1)
        } else if (/^[\d+\-*×/().\s]+$/.test(text) && !/^\d+$/.test(text)) {
            getGroupInfo(chatid).then(res => {
                if (res.jisuanStatus == 1) {
                    const val = evaluateExpression(text)
                    if (val != null) {
                        bot.sendMessage(chatid, '' + val, {
                            reply_to_message_id: message_id
                        })
                    }
                }
            })
        } else if (text == '汇率') {
            const val = await getHuilv(chatid)
            bot.sendMessage(chatid, `当前汇率为 ${val}`, {
                reply_to_message_id: message_id
            })
        } else if (text == '显示操作人') {
            await isCozuoren(chatid, userid)
            showCaozuoren(chatid, message_id)
        } else if (text == '上课') {
            await isCozuoren(chatid, userid)
            shangxiake(1, chatid)
        } else if (text == '下课') {
            await isCozuoren(chatid, userid)
            shangxiake(0, chatid)
        }
        changeTitle(chatid, title)
    } else if (type == 'private') {
        if (text == '/start') {
            bot.sendMessage(userid, `🙋Hi,${first_name}${last_name},欢迎使用自助记账机器人`, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard,
                    resize_keyboard: true
                }
            })
        } else if (text == '📕使用说明') {
            bot.sendMessage(userid, caozuoshouce, {
                parse_mode: 'HTML'
            })
        } else if (text == '🏦U兑TRX') {
            bot.sendMessage(userid, 'https://t.me/+4Cf_vjvu-qE1ZDll')
        } else if (text == '🚀开始使用') {
            bot.sendMessage(userid, '我是记账机器人', {
                reply_markup: {
                    inline_keyboard: [[{ text: '点击拉我入群', url: 'https://t.me/MYZF_Bot?startgroup=start' }]]
                }
            })
        }
    }
})


//上下课
function shangxiake(type, chatid) {
    const permissions = {
        can_send_messages: type === 1,
        can_send_media_messages: type === 1,
    };
    bot.setChatPermissions(chatid, permissions).then(() => {
        bot.sendMessage(chatid, `本群已${type ? '上' : '下'}课`)
    })
}


// 现实操作人列表
function showCaozuoren(chatid, msgid) {
    const sql = `select * from groupList where id = ${Math.abs(chatid)}`
    pool.query(sql, (err, resuelt) => {
        if (err) return
        if (resuelt[0]) {
            bot.getChatAdministrators(chatid)
                .then((res) => {
                    const admins = resuelt[0].admin.split(',')
                    let msg = '<b>操作人列表</b>\n\n'
                    res.filter(admin => admins.includes(String(admin.user.id)))
                        .forEach((el, i) => {
                            msg += `${i}.  ${el.user.first_name}${el.user.last_name}  @${el.user.username}\n`
                        })
                    bot.sendMessage(chatid, msg, {
                        parse_mode: 'HTML',
                        reply_to_message_id: msgid
                    })
                })
        }
    })
}

//设置群计算功能
function jisuangongneng(chatid, jisuanStatus) {
    const sql = `SELECT * FROM groupList WHERE id = ${Math.abs(chatid)}`
    pool.query(sql, (err, res) => {
        if (err) return
        if (res.length && res[0].id) {
            if (res[0].jisuanStatus != jisuanStatus) {
                const sql = `update groupList set jisuanStatus = '${jisuanStatus}' where id = ${Math.abs(chatid)}`
                pool.query(sql, (err, res) => {
                    if (err) return
                    bot.sendMessage(chatid, `计算功能已${jisuanStatus ? '开启' : '关闭'}`)
                })
            } else {
                bot.sendMessage(chatid, `计算功能已是${jisuanStatus ? '开启' : '关闭'}状态`)
            }
        }
    })
}

// 获取群信息
function getGroupInfo(chatid) {
    return new Promise((resolve, reject) => {
        const sql = `select * from groupList where id = ${Math.abs(chatid)}`
        pool.query(sql, (err, res) => {
            if (err) return
            if (res[0] && res[0].id) {
                resolve(res[0])
            }
        })
    })
}

// 更新群title
function changeTitle(chatid, title) {
    const sql = `SELECT * FROM groupList WHERE id = ${Math.abs(chatid)}`
    pool.query(sql, (err, res) => {
        if (err) return
        if (res.length && res[0].id && res[0].title != title) {
            const sql = `update groupList set title = '${title}' where id = ${Math.abs(chatid)}`
            pool.query(sql)
        }
    })
}

// 被移除群
function leaveGroup(chatid) {
    const sql = `DELETE FROM groupList WHERE id = ${Math.abs(chatid)}`
    pool.query(sql, (err, res) => {
        if (err) return console.log(err);
        const sql = `DROP TABLE group${Math.abs(chatid)}`
        pool.query(sql)
    })
}

// 被拉入群
function onInvite(data) {
    return new Promise((resolve, reject) => {
        const { chatid, inviterId } = data
        const sql = `select * from groupList where id = ${Math.abs(chatid)}`
        pool.query(sql, (err, res) => {
            if (res.length == 0) {
                const sql = `INSERT INTO groupList (id, inviterId, admin) VALUES (${Math.abs(chatid)}, ${Number(inviterId)}, "${String(inviterId)}")`
                pool.query(sql, (err, res) => {
                    if (err) return console.log(err, 'onInvite-Sql-ERROR');
                    resolve()
                })
            } else {
                const sql = `update groupList set inviterId = ${Number(inviterId)}, admin = "${String(inviterId)}"`
                pool.query(sql, (err, res) => {
                    if (err) return
                    bot.sendMessage(chatid, '回归提示：操作人信息已重置，需重新添加操作人！')
                })
            }
        })
    })
}
//是否拉群人
function isInvite(data) {
    return new Promise((resolve, reject) => {
        const { chatid, userid } = data
        const sql = `SELECT * FROM groupList WHERE id = ${Math.abs(chatid)}`
        pool.query(sql, (err, res) => {
            if (err) return console.log(err, 'isInvite-sql-error');
            const inviterId = res[0]?.inviterId
            if (inviterId && inviterId == userid) {
                resolve()
            }
        })
    })
}
// 是否是操作人
function isCozuoren(chatid, userid) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM groupList WHERE id = ${Math.abs(chatid)}`
        pool.query(sql, (err, res) => {
            console.log(res, 'isCozuoren67');
            if (err) return console.log(err);
            let admin = res[0]?.admin
            if (!admin || admin === null) {
                return
            } else {
                admin = admin.split(',')
                let val = admin.findIndex(item => item == userid)
                if (val != -1) {
                    resolve()
                }
            }
        })
    })
}

//查询群状态
function getGroupStatus(chatid) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM groupList WHERE id = ${Math.abs(chatid)}`
        pool.query(sql, (err, res) => {
            if (err) return
            const status = res[0]?.status
            if (typeof status != 'undefined') {
                resolve(status)
            }
            if (status == 0) {
                bot.sendMessage(chatid, `请先输入开始`)
            }
        })
    })
}

async function jinrizhangdan(chatid, day = 0, date = null) {
    try {
        let sql
        let title
        if (day == 0) {
            title = '今日'
            sql = `SELECT * FROM group${chatid} WHERE DATE(create_time) = CURDATE();`
        } else if (day == 1) {
            title = '昨日'
            sql = `SELECT * FROM group${chatid} WHERE DATE(create_time) = DATE(CURRENT_TIMESTAMP) - INTERVAL 1 DAY;`
        } else if (day == 3 && date) {
            title = date
            sql = `SELECT * FROM group${chatid} WHERE DATE(create_time) = '${date}';`
        }
        pool.query(sql, (err, res) => {
            if (err) return console.log(err);
            // 入款统计
            const rukuanList = res.filter(item => item.type == 0)
            let rukuanText = `${title}入款(${rukuanList.length})笔`
            let yingxiafaR = 0
            let yingxiafaU = 0
            rukuanList.forEach(item => {
                yingxiafaR += item.amount
                yingxiafaU += formatNumber(item.amount / item.huilv)
                rukuanText += `\n<pre>时间:${formatTime(item.create_time)}   操作人:${item.username}  \n金额:${item.amount} / ${item.huilv} = ${formatNumber(item.amount / item.huilv)}U</pre>`
            })

            // 下发统计
            const xiafaList = res.filter(item => item.type == 1)
            let xiafaText = `${title}下发(${xiafaList.length})笔`
            let yixiafaR = 0
            let yixiafaU = 0
            xiafaList.forEach(item => {
                yixiafaR += item.amount
                yixiafaU += formatNumber(item.amount / item.huilv)
                xiafaText += `\n<pre>时间:${formatTime(item.create_time)}   操作人:${item.username}  \n金额:${formatNumber(item.amount / item.huilv)}U</pre>`
            })

            const weixiafaR = formatNumber(yingxiafaR - yixiafaR)
            const weixiafaU = formatNumber(yingxiafaU - yixiafaU)

            const msg = `${rukuanText}\n${xiafaText}\n<code>应下发：${formatNumber(yingxiafaR)} | ${formatNumber(yingxiafaU)}U</code>\n<code>已下发：${formatNumber(yixiafaR)} | ${formatNumber(yixiafaU)}U</code>\n<code>未下发：${weixiafaR} | ${weixiafaU}U</code>`
            bot.sendMessage(`-${chatid}`, msg, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: 'USDT闪兑TRX(测试中)', url: 'https://t.me/+4Cf_vjvu-qE1ZDll' }]]
                },
            })


        })
    } catch (error) {
        console.log(error);
    }
}

// 记账
async function jizhang(msg, myType = 0) {
    return new Promise(async (resolve, reject) => {
        try {
            const { text, message_id } = msg
            const { id: userid, first_name, last_name } = msg.from
            const { id: chatid, type } = msg.chat
            const currentHuilv = await getHuilv(chatid)
            let amount
            if (myType == 0) {
                amount = Number(text)
            } else {
                amount = text.split('下发')[1]
                if (/^[-+]?[0-9]+(?:\.[0-9]+)?u$/.test(amount)) {
                    amount = amount.split('u')[0] * currentHuilv
                } else {
                    if (/^-?\d+(\.\d+)?$/.test(amount)) {
                        amount = Number(amount)
                    } else {
                        return
                    }
                }
            }
            const { username } = await bot.getChat(userid)
            const sql = `INSERT INTO group${Math.abs(chatid)} (amount, huilv, username, msgid, type) VALUES (${amount}, ${currentHuilv}, '${username}', ${message_id}, ${myType})`
            pool.query(sql, (err, res) => {
                if (err) {
                    return console.log(err);
                }
                console.log(text);
                bot.sendMessage(chatid, text, {
                    reply_to_message_id: message_id
                })
            })
        } catch (error) {
            console.log(error);
        }
    })
}


//添加操作人
async function caozuoren(msg, caozuoType) {
    return new Promise((resolve, reject) => {
        const { text } = msg
        const { id: userid, first_name, last_name, username } = msg.from
        const { id: chatid, type } = msg.chat
        const name = text.split(`${caozuoType}操作人 @`)[1]
        bot.getChatAdministrators(chatid)
            .then((res) => {
                const member = res.find(admin => admin.user.username === name);
                console.log(member);
                if (member) {
                    const sql = `SELECT * FROM groupList WHERE id = ${Math.abs(chatid)};`
                    pool.query(sql, (err, res) => {
                        if (err) {
                            return
                        }
                        const admin = res[0].admin
                        let newAdmin
                        if (admin === null) {
                            newAdmin = String(member.user.id)
                            if (caozuoType == '移除') {
                                return bot.sendMessage(chatid, `${name} 不是操作人`)
                            }
                        } else {
                            if (caozuoType == '添加') {
                                console.log(admin);
                                if (admin.split(',').includes(String(member.user.id))) {
                                    return bot.sendMessage(chatid, `${name} 已经是操作人`)
                                } else {
                                    newAdmin = admin + `,${String(member.user.id)}`
                                }
                            } else if (caozuoType == '移除') {
                                if (admin.split(',').includes(String(member.user.id))) {
                                    newAdmin = admin.split(',').filter(item => item !== String(member.user.id))
                                } else {
                                    return bot.sendMessage(chatid, `${name} 不是操作人`)
                                }
                            }
                        }
                        const sql = caozuoType == '添加' ?
                            `update groupList set admin = '${newAdmin}' where id = ${Math.abs(chatid)}` :
                            `update groupList set admin = ${newAdmin.join(',') == '' ? null : `'${newAdmin.join(',')}'`} where id = ${Math.abs(chatid)}`
                        pool.query(sql, (err, res) => {
                            if (err) {
                                console.log(err);
                                return
                            }
                            bot.sendMessage(chatid, `成功${caozuoType}操作人 @${name}`)
                        })
                    })
                } else {
                    bot.sendMessage(chatid, '用户不在群内或用户不是管理员')
                }
            })
    })
}

//查询汇率
async function getHuilv(chatid) {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM groupList WHERE id = ${Math.abs(chatid)}`, (err, res) => {
            if (err) return
            const huilv = res[0].huilv
            resolve(huilv)
        })
    })
}

//设置汇率
async function shezhihuilv(chatid, num) {
    return new Promise((resolve, reject) => {
        try {
            if ((typeof num === 'number' || (typeof num === 'string' && !isNaN(parseFloat(num))))) {
                console.log(num);
                pool.query(`update groupList set huilv = ${num} where id = ${Math.abs(chatid)}`, (err, res) => {
                    console.log(err, res);
                    if (err) {
                        return console.log(err);
                    }
                    bot.sendMessage(chatid, `汇率设置成功 --> ${num}\n之后每笔入款将按照最新汇率执行`)
                })
            } else {
                bot.sendMessage(chatid, '汇率设置错误')
            }
        } catch (error) {
            console.log(error);
        }
    })
}

// 开始
async function kaishi(chatid) {
    await createTable(Math.abs(chatid))
}

// 创建表的函数
function createTable(groupid) {
    return new Promise((resolve, reject) => {
        const tableName = 'group' + groupid
        const sql = `SELECT * FROM groupList WHERE id = ${Math.abs(groupid)}`
        pool.query(sql, (err, res) => {
            if (err) return console.log(err, 'createTable-sql-error-1');
            const status = res[0].status
            if (status == 0) {
                bot.sendMessage(`-${groupid}`, '正在初始化请稍后...').then((msg) => {
                    const createTableSQL = `
                  CREATE TABLE IF NOT EXISTS ${tableName} (
                    amount INT NOT NULL,
                    huilv FLOAT NOT NULL,
                    type INT DEFAULT 0,
                    msgid INT NOT NULL,
                    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    username VARCHAR(255)
                  )
                `;
                    pool.query(createTableSQL, (err, res) => {
                        if (err) return console.error('创建表失败：', err)
                        console.log(`成功创建表 ${tableName}`);
                        pool.query(`update  groupList set status = 1 where id = ${Math.abs(groupid)};`, (err, res) => {
                            if (err) return
                            bot.editMessageText('现在可以设置操作人和汇率', {
                                chat_id: msg.chat.id,
                                message_id: msg.message_id,
                            })
                            resolve()
                        })
                    })
                })
            } else if (status == 1) {
                bot.sendMessage(`-${groupid}`, '已经执行过开始了')
            }
        })



    })
}

function huilv(msg) {
    bot.sendMessage(msg.chat.id, `<b>选择查看价格类别👇</b>`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "购买价格", callback_data: "huilvbuy_all" }, { text: "出售价格", callback_data: "huilvsell_all" }]
            ]
        },
        parse_mode: "HTML"
    });
}

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    console.log(callbackQuery);
    if (callbackQuery.data.search("huilvbuy_") != -1) {
        changehuilvbuy(callbackQuery)
    } else if (callbackQuery.data.search("huilvsell_") != -1) {
        changehuilvsell(callbackQuery)
    } else if (callbackQuery.data == "back") { // Copyrigth by @miya0v0
        backhuilv(callbackQuery)
    } else if (callbackQuery.data.search('setHuilv') != -1) {
        const num = callbackQuery.data.split(',')[1]
        const chatid = callbackQuery.data.split(',')[2]
        shezhihuilv(chatid, num)
    } else if (callbackQuery.data == '开始') {
        await isInvite({ chatid: callbackQuery.message.chat.id, userid: callbackQuery.from.id })
        await kaishi(callbackQuery.message.chat.id)
        bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id)
    }
});

function backhuilv(msg) {
    bot.editMessageText('<b>选择查看价格类别👇</b>', {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
        reply_markup: {
            inline_keyboard: [
                [{ text: "购买价格", callback_data: "huilvbuy_all" }, { text: "出售价格", callback_data: "huilvsell_all" }]
            ]
        },
        parse_mode: "HTML"
    })
}

//查询欧意实时购买汇率
function changehuilvbuy(msg) {
    var method = msg.data.split("huilvbuy_")[1]
    request({
        url: `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=sell&paymentMethod=${method}&userType=blockTrade&showTrade=false&receivingAds=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&urlId=2`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Priority': 'u=0, i',
            'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        }
    }).then((res) => {
        var sendvalue, yhk = "银行卡", zfb = "支付宝", wx = "微信", all = "所有"
        if (method == "bank") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【银行卡实时购买汇率】</b>\n\n";
            yhk = "✅银行卡"
        } else if (method == "aliPay") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【支付宝实时购买汇率】</b>\n\n";
            zfb = "✅支付宝"
        } else if (method == "wxPay") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【微信实时购买汇率】</b>\n\n";
            wx = "✅微信"
        } else if (method == "all") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【实时购买汇率】</b>\n\n";
            all = "✅所有"
        }
        var allprice = 0
        for (let index = 0; index < 10; index++) {
            const element = res.data.data.sell[index];
            sendvalue = `${sendvalue}购买${index + 1}    ${element.price}\n`
            allprice += parseFloat(element.price)
        }
        // sendvalue = `${sendvalue}\n实时价格：1 USDT * ${(allprice / 10).toFixed(5)} = ${((allprice / 10)).toFixed(2)}`
        bot.editMessageText(sendvalue, {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: all, callback_data: "huilvbuy_all" }, { text: wx, callback_data: "huilvbuy_wxPay" }, { text: zfb, callback_data: "huilvbuy_aliPay" }, { text: yhk, callback_data: "huilvbuy_bank" }],
                    [{ text: '设置第三档为汇率', callback_data: `setHuilv,${res.data.data.sell[2].price},${msg.message.chat.id}` }],
                    [{ text: "返回", callback_data: "back" }],
                ]
            },
            parse_mode: "HTML",
            disable_web_page_preview: true
        })
    }).catch(err => {
        console.log(err, 'changehuilvbuy-err');
    })
}

//查询欧意实时出售汇率
function changehuilvsell(msg) {
    var method = msg.data.split("huilvsell_")[1]
    request({
        url: `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=${method}&userType=blockTrade`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Priority': 'u=0, i',
            'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        }
    }).then((res) => {
        var sendvalue, yhk = "银行卡", zfb = "支付宝", wx = "微信", all = "所有"
        if (method == "bank") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【银行卡实时出售汇率】</b>\n\n";
            yhk = "✅银行卡"
        } else if (method == "aliPay") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【支付宝实时出售汇率】</b>\n\n";
            zfb = "✅支付宝"
        } else if (method == "wxPay") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【微信实时出售汇率】</b>\n\n";
            wx = "✅微信"
        } else if (method == "all") {
            sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【实时出售汇率】</b>\n\n";
            all = "✅所有"
        }
        var allprice = 0
        try {
            for (let index = 0; index < 10; index++) {
                const element = res.data.data.buy[index];
                sendvalue = `${sendvalue}出售${index + 1}    ${element.price}\n`
                allprice += parseFloat(element.price)
            }
            // sendvalue = `${sendvalue}\n实时价格：1 USDT * ${(allprice / 10).toFixed(5)} = ${((allprice / 10)).toFixed(2)}`
            bot.editMessageText(sendvalue, {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: all, callback_data: "huilvsell_all" }, { text: wx, callback_data: "huilvsell_wxPay" }, { text: zfb, callback_data: "huilvsell_aliPay" }, { text: yhk, callback_data: "huilvsell_bank" }],
                        [{ text: '设置第三档为汇率', callback_data: `setHuilv,${res.data.data.buy[2].price},${msg.message.chat.id}` }],
                        [{ text: "返回", callback_data: "back" }],
                    ]
                },
                parse_mode: "HTML",
                disable_web_page_preview: true
            })
        } catch (e) {
            return
        }
    }).catch(err => {
        console.log(err, 'changehuilvsell-err');
    })
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function formatNumber(num) {
    const decimalCount = (num.toString().split('.')[1] || '').length;

    if (decimalCount > 2) {
        return parseFloat(num.toFixed(2));
    } else {
        return num;
    }
}

module.exports = {
    bot
}