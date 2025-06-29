var TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const constants = require('./constants');

var { isProd, pool, request, evaluateExpression, adminId, tgToken, query } = require('./utils');

var bot = isProd ? new TelegramBot(tgToken, {
    polling: true,
}) : new TelegramBot(tgToken, {
    polling: true,
    request: {   //代理   部署时不需要
        proxy: config.proxy.url,
    }
});

// 测试数据库连接
async function testDatabaseConnection() {
    try {
        const result = await query('SELECT 1 as test');
        console.log('数据库连接正常:', result);
        return true;
    } catch (error) {
        console.error('数据库连接测试失败:', error.message);
        return false;
    }
}

// 异步发送启动消息
(async () => {
    try {
        console.log('🔧 开始初始化机器人...');
        
        // 检查关键配置
        console.log('📋 配置检查:');
        console.log('  - 环境模式:', isProd ? '生产环境' : '开发环境');
        console.log('  - Token长度:', tgToken ? tgToken.length : '未设置');
        console.log('  - AdminId:', adminId);
        
        if (!tgToken) {
            throw new Error('❌ Telegram Bot Token 未设置！请在 config.js 中填入正确的 token');
        }
        
        console.log('🗄️ 测试数据库连接...');
        await testDatabaseConnection();
        
        console.log('🤖 获取机器人信息...');
        const botInfo = await bot.getMe();
        console.log('✅ 机器人信息:', {
            id: botInfo.id,
            username: botInfo.username,
            first_name: botInfo.first_name,
            can_join_groups: botInfo.can_join_groups,
            can_read_all_group_messages: botInfo.can_read_all_group_messages
        });
        
        // 测试机器人是否能发送消息
        console.log('📤 发送启动消息...');
        await bot.sendMessage(adminId, `🤖 机器人启动成功!
        
🆔 机器人ID: ${botInfo.id}
👤 用户名: @${botInfo.username}
📛 名称: ${botInfo.first_name}
🏷️ 环境: ${isProd ? '生产' : '开发'}

请先私聊发送 /test 测试机器人是否正常工作`);
        
        console.log('✅ 机器人启动完成，开始监听消息...');
        
        // 设置轮询参数，增加调试信息
        console.log('📡 轮询状态:', bot.isPolling());
        console.log('⚙️ 机器人配置:', {
            polling: true,
            hasProxy: !isProd,
            proxyUrl: !isProd ? config.proxy.url : '无代理'
        });
        
        // 测试轮询是否正常工作
        setTimeout(() => {
            console.log('🔍 5秒后检查轮询状态:', bot.isPolling());
            if (!bot.isPolling()) {
                console.error('❌ 轮询未正常启动！');
            } else {
                console.log('✅ 轮询正常运行中...');
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ 启动失败:', error.message);
        console.error('📋 错误详情:', error);
        
        if (error.message.includes('401')) {
            console.error('🔑 Token 错误！请检查 config.js 中的 tgToken 是否正确');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            console.error('🌐 网络错误！请检查网络连接或代理设置');
        }
        
        process.exit(1);
    }
})();

// 添加更详细的错误监听
bot.on('polling_error', (error) => {
    console.error('❌ 轮询错误:', error.message);
    console.error('错误代码:', error.code);
    console.error('完整错误:', error);
});

bot.on('error', (error) => {
    console.error('❌ 机器人错误:', error.message);
    console.error('完整错误:', error);
});

// 监听 webhook 错误（如果使用 webhook 模式）
bot.on('webhook_error', (error) => {
    console.error('❌ Webhook 错误:', error.message);
});

// 首先测试最基本的消息监听
console.log('🚀 开始设置事件监听器...');

bot.on('message', async (msg) => {
    try {
        // 通用调试日志
        console.log('📨 === 收到消息事件 ===');
        console.log('📍 消息类型:', msg.chat?.type);
        console.log('📝 消息内容:', msg.text || '无文本');
        console.log('👤 发送人ID:', msg.from?.id);
        console.log('👥 新成员:', msg.new_chat_participant?.id);
        console.log('👋 离开成员:', msg.left_chat_participant?.id);
        console.log('💬 聊天ID:', msg.chat?.id);
        console.log('🕐 消息时间:', new Date(msg.date * 1000));
        console.log('📄 完整消息对象键:', Object.keys(msg));
        console.log('========================');

        const { text } = msg
        const { id: userid, first_name, last_name, username } = msg.from || {}
        const { id: chatid, type } = msg.chat || {}
        const { new_chat_participant, left_chat_participant } = msg
        
        // 处理新成员加入 - 添加更多调试信息
        if (new_chat_participant) {
            console.log('🎉 检测到新成员加入事件');
            console.log('新成员信息:', {
                id: new_chat_participant.id,
                first_name: new_chat_participant.first_name,
                username: new_chat_participant.username,
                is_bot: new_chat_participant.is_bot
            });
            console.log('群组类型:', type);
            
            if (type == 'group' || type == 'supergroup') {
                const res = await bot.getMe();
                console.log('🤖 当前机器人ID:', res.id);
                console.log('🆕 新成员ID:', new_chat_participant.id);
                console.log('🔍 是否是机器人自己:', new_chat_participant.id == res.id);
                
                if (new_chat_participant.id == res.id) {
                    console.log(`🎊 机器人被添加到群组: ${chatid}, 邀请人: ${userid}`);
                    await onInvite({ chatid, inviterId: userid });
                    await bot.sendMessage(
                        chatid,
                        `🙋大家好,我是<b>记账机器人</b>\n😊感谢把我加入贵群！\n💱请邀请人先输入开始进行初始化。`,
                        {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [[{ text: '开始', callback_data: "开始" }]]
                            },
                        }
                    );
                    console.log(`✅ 群组 ${chatid} 初始化信息已发送`);
                } else {
                    console.log('👤 新成员不是机器人，忽略');
                }
            } else {
                console.log('📍 不是群组消息，群组类型:', type);
            }
        } else if (left_chat_participant) {
            console.log('👋 有成员离开群组:', left_chat_participant.id);
        }

        // 处理文本消息
        if (text) {
            console.log('📝 处理文本消息:', text);
            const { message_id } = msg
            const { title } = msg.chat
            
            if (type == 'group' || type == 'supergroup') {
                console.log('👥 群组消息处理');
                if (text == '开始') {
                    console.log('🚀 收到开始命令');
                    try {
                        await isInvite({ chatid, userid })
                        await kaishi(chatid)
                    } catch (error) {
                        console.error('开始命令错误:', error);
                        await bot.sendMessage(chatid, `开始命令执行失败: ${error.message}`);
                    }
                } else if (text == '/test') {
                    console.log('🧪 收到测试命令');
                    bot.sendMessage(chatid, '✅ 机器人工作正常！群组消息测试成功');
                }
                // ...existing text handling code...
                changeTitle(chatid, title);
            } else if (type == 'private') {
                console.log('👤 私聊消息处理');
                if (text == '/start' || text == '/test') {
                    console.log('🧪 收到私聊测试命令');
                    bot.sendMessage(userid, `🙋Hi,${first_name}${last_name},欢迎使用自助记账机器人！\n✅ 机器人工作正常！`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            keyboard: constants.keyboard,
                            resize_keyboard: true
                        }
                    })
                }
                // ...existing private message handling...
            }
        } else {
            console.log('📭 收到非文本消息或系统消息');
        }
        
    } catch (error) {
        console.error('❌ 处理消息时发生错误:', error.message);
        console.error('错误详情:', error);
        console.error('消息内容:', msg);
    }
});

console.log('✅ 事件监听器设置完成');

//上下课
async function shangxiake(type, chatid) {
    try {
        const permissions = {
            can_send_messages: type === 1,
            can_send_media_messages: type === 1,
        };
        await bot.setChatPermissions(chatid, permissions);
        await bot.sendMessage(chatid, `本群已${type ? '上' : '下'}课`);
    } catch (error) {
        console.error('设置群权限错误:', error.message);
    }
}


// 现实操作人列表
async function showCaozuoren(chatid, msgid) {
    try {
        const sql = `select * from grouplist where id = ${Math.abs(chatid)}`;
        const result = await query(sql);
        
        if (result[0]) {
            const res = await bot.getChatAdministrators(chatid);
            const admins = result[0].admin.split(',');
            let msg = '<b>操作人列表</b>\n\n';
            res.filter(admin => admins.includes(String(admin.user.id)))
                .forEach((el, i) => {
                    msg += `${i}.  ${el.user.first_name}${el.user.last_name}  @${el.user.username}\n`;
                });
            
            await bot.sendMessage(chatid, msg, {
                parse_mode: 'HTML',
                reply_to_message_id: msgid
            });
        }
    } catch (error) {
        console.error('显示操作人错误:', error.message);
    }
}

//设置群计算功能
async function jisuangongneng(chatid, jisuanStatus) {
    try {
        const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        if (res.length && res[0].id) {
            if (res[0].jisuanStatus != jisuanStatus) {
                const updateSql = `update grouplist set jisuanStatus = '${jisuanStatus}' where id = ${Math.abs(chatid)}`;
                await query(updateSql);
                await bot.sendMessage(chatid, `计算功能已${jisuanStatus ? '开启' : '关闭'}`);
            } else {
                await bot.sendMessage(chatid, `计算功能已是${jisuanStatus ? '开启' : '关闭'}状态`);
            }
        }
    } catch (error) {
        console.error('设置计算功能错误:', error.message);
    }
}

// 获取群信息
async function getGroupInfo(chatid) {
    try {
        const sql = `select * from grouplist where id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        if (res[0] && res[0].id) {
            return res[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('获取群信息错误:', error.message);
        throw error;
    }
}

// 更新群title
async function changeTitle(chatid, title) {
    try {
        const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        if (res.length && res[0].id && res[0].title != title) {
            const updateSql = `update grouplist set title = '${title}' where id = ${Math.abs(chatid)}`;
            await query(updateSql);
        }
    } catch (error) {
        console.error('更新群标题错误:', error.message);
    }
}

// 被移除群
async function leaveGroup(chatid) {
    try {
        const sql = `DELETE FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        await query(sql);
        
        const dropSql = `DROP TABLE group${Math.abs(chatid)}`;
        await query(dropSql);
    } catch (error) {
        console.error('离开群组错误:', error.message);
    }
}

// 被拉入群
async function onInvite(data) {
    try {
        const { chatid, inviterId } = data;
        const sql = `select * from grouplist where id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        if (res.length == 0) {
            const insertSql = `INSERT INTO grouplist (id, inviterId, admin, status, huilv) VALUES (${Math.abs(chatid)}, ${Number(inviterId)}, "${String(inviterId)}", 0, 1)`;
            await query(insertSql);
        } else {
            const updateSql = `update grouplist set inviterId = ${Number(inviterId)}, admin = "${String(inviterId)}", status = 0 where id = ${Math.abs(chatid)}`;
            await query(updateSql);
            await bot.sendMessage(chatid, '回归提示：操作人信息已重置，需重新添加操作人！');
        }
    } catch (error) {
        console.error('处理群邀请错误:', error.message);
        throw error;
    }
}
//是否拉群人
async function isInvite(data) {
    try {
        const { chatid, userid } = data;
        const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        const inviterId = res[0]?.inviterId;
        if (inviterId && inviterId == userid) {
            return true;
        } else {
            throw new Error('没有权限');
        }
    } catch (error) {
        console.error('检查邀请权限错误:', error.message);
        throw error;
    }
}
// 是否是操作人
async function isCozuoren(chatid, userid) {
    try {
        let sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        let admin = res[0]?.admin;
        if (!admin || admin === null) {
            throw new Error('没有操作权限');
        } else {
            admin = admin.split(',');
            let val = admin.findIndex(item => item == userid);
            if (val != -1) {
                return true;
            } else {
                throw new Error('没有操作权限');
            }
        }
    } catch (error) {
        console.error('检查操作权限错误:', error.message);
        throw error;
    }
}

//查询群状态
async function getGroupStatus(chatid) {
    try {
        const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        
        const status = res[0]?.status;
        if (typeof status != 'undefined') {
            if (status == 0) {
                await bot.sendMessage(chatid, `请先输入开始`);
            }
            return status;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('查询群状态错误:', error.message);
        throw error;
    }
}

async function jinrizhangdan(chatid, day = 0, date = null) {
    try {
        let sql;
        let title;
        if (day == 0) {
            title = '今日';
            sql = `SELECT * FROM group${chatid} WHERE DATE(create_time) = CURDATE();`;
        } else if (day == 1) {
            title = '昨日';
            sql = `SELECT * FROM group${chatid} WHERE DATE(create_time) = DATE(CURRENT_TIMESTAMP) - INTERVAL 1 DAY;`;
        } else if (day == 3 && date) {
            title = date;
            sql = `SELECT * FROM group${chatid} WHERE DATE(create_time) = '${date}';`;
        }
        
        const res = await query(sql);
        
        // 入款统计
        const rukuanList = res.filter(item => item.type == 0);
        let rukuanText = `${title}入款(${rukuanList.length})笔`;
        let yingxiafaR = 0;
        let yingxiafaU = 0;
        rukuanList.forEach(item => {
            yingxiafaR += item.amount;
            yingxiafaU += formatNumber(item.amount / item.huilv);
            rukuanText += `\n<pre>时间:${formatTime(item.create_time)}   操作人:${item.username}  \n金额:${item.amount} / ${item.huilv} = ${formatNumber(item.amount / item.huilv)}U</pre>`;
        });

        // 下发统计
        const xiafaList = res.filter(item => item.type == 1);
        let xiafaText = `${title}下发(${xiafaList.length})笔`;
        let yixiafaR = 0;
        let yixiafaU = 0;
        xiafaList.forEach(item => {
            yixiafaR += item.amount;
            yixiafaU += formatNumber(item.amount / item.huilv);
            xiafaText += `\n<pre>时间:${formatTime(item.create_time)}   操作人:${item.username}  \n金额:${formatNumber(item.amount / item.huilv)}U</pre>`;
        });

        const weixiafaR = formatNumber(yingxiafaR - yixiafaR);
        const weixiafaU = formatNumber(yingxiafaU - yixiafaU);

        const msg = `${rukuanText}\n${xiafaText}\n<code>\n应下发：${formatNumber(yingxiafaR)} | ${formatNumber(yingxiafaU)}U</code>\n<code>已下发：${formatNumber(yixiafaR)} | ${formatNumber(yixiafaU)}U</code>\n<code>未下发：${weixiafaR} | ${weixiafaU}U</code>`;
        
        await bot.sendMessage(`-${chatid}`, msg, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: 'USDT闪兑TRX', url: 'https://t.me/+4Cf_vjvu-qE1ZDll' }]]
            },
        });
    } catch (error) {
        console.error('查询账单错误:', error.message);
    }
}

// 记账
async function jizhang(msg, myType = 0) {
    try {
        const { text, message_id } = msg;
        const { id: userid, first_name, last_name } = msg.from;
        const { id: chatid, type } = msg.chat;
        const currentHuilv = await getHuilv(chatid);
        let amount;
        
        if (myType == 0) {
            amount = Number(text);
        } else {
            amount = text.split('下发')[1];
            if (/^[-+]?[0-9]+(?:\.[0-9]+)?u$/.test(amount)) {
                amount = amount.split('u')[0] * currentHuilv;
            } else {
                if (/^-?\d+(\.\d+)?$/.test(amount)) {
                    amount = Number(amount);
                } else {
                    throw new Error('金额格式错误');
                }
            }
        }
        
        const { username } = await bot.getChat(userid);
        const sql = `INSERT INTO group${Math.abs(chatid)} (amount, huilv, username, msgid, type) VALUES (${amount}, ${currentHuilv}, '${username}', ${message_id}, ${myType})`;
        await query(sql);
        
        await bot.sendMessage(chatid, text, {
            reply_to_message_id: message_id
        });
    } catch (error) {
        console.error('记账错误:', error.message);
        throw error;
    }
}


//添加操作人
async function caozuoren(msg, caozuoType) {
    try {
        const { text } = msg;
        const { id: userid, first_name, last_name, username } = msg.from;
        const { id: chatid, type } = msg.chat;
        const name = text.split(`${caozuoType}操作人 @`)[1];
        
        const res = await bot.getChatAdministrators(chatid);
        const member = res.find(admin => admin.user.username === name);

        if (member) {
            const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)};`;
            const result = await query(sql);
            const admin = result[0].admin;
            let newAdmin;
            
            if (admin === null) {
                newAdmin = String(member.user.id);
                if (caozuoType == '移除') {
                    await bot.sendMessage(chatid, `${name} 不是操作人`);
                    return;
                }
            } else {
                if (caozuoType == '添加') {
                    if (admin.split(',').includes(String(member.user.id))) {
                        await bot.sendMessage(chatid, `${name} 已经是操作人`);
                        return;
                    } else {
                        newAdmin = admin + `,${String(member.user.id)}`;
                    }
                } else if (caozuoType == '移除') {
                    if (admin.split(',').includes(String(member.user.id))) {
                        newAdmin = admin.split(',').filter(item => item !== String(member.user.id));
                    } else {
                        await bot.sendMessage(chatid, `${name} 不是操作人`);
                        return;
                    }
                }
            }
            
            const updateSql = caozuoType == '添加' ?
                `update grouplist set admin = '${newAdmin}' where id = ${Math.abs(chatid)}` :
                `update grouplist set admin = ${newAdmin.join(',') == '' ? null : `'${newAdmin.join(',')}'`} where id = ${Math.abs(chatid)}`;
            
            await query(updateSql);
            await bot.sendMessage(chatid, `成功${caozuoType}操作人 @${name}`);
        } else {
            await bot.sendMessage(chatid, '用户不在群内或用户不是管理员');
        }
    } catch (error) {
        console.error('操作人管理错误:', error.message);
        throw error;
    }
}

//查询汇率
async function getHuilv(chatid) {
    try {
        const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(chatid)}`;
        const res = await query(sql);
        return res[0].huilv;
    } catch (error) {
        console.error('查询汇率错误:', error.message);
        throw error;
    }
}

//设置汇率
async function shezhihuilv(chatid, num) {
    try {
        if ((typeof num === 'number' || (typeof num === 'string' && !isNaN(parseFloat(num))))) {
            const sql = `update grouplist set huilv = ${num} where id = ${Math.abs(chatid)}`;
            await query(sql);
            await bot.sendMessage(chatid, `汇率设置成功 --> ${num}\n之后每笔入款将按照最新汇率执行`);
        } else {
            await bot.sendMessage(chatid, '汇率设置错误');
        }
    } catch (error) {
        console.error('设置汇率错误:', error.message);
    }
}

// 开始
async function kaishi(chatid) {
    await createTable(Math.abs(chatid))
}

// 创建表的函数
async function createTable(groupid) {
    try {
        const tableName = 'group' + groupid;
        const sql = `SELECT * FROM grouplist WHERE id = ${Math.abs(groupid)}`;
        const res = await query(sql);
        
        // 检查查询结果是否存在
        if (res.length === 0) {
            console.error('群组记录不存在，无法创建表');
            await bot.sendMessage(`-${groupid}`, '初始化失败：群组记录不存在，请重新拉取机器人');
            return;
        }
        
        const status = res[0].status;
        
        if (status == 0) {
            const msg = await bot.sendMessage(`-${groupid}`, '正在初始化请稍后...');
            
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
            
            await query(createTableSQL);
            console.log(`成功创建表: ${tableName}`);
            
            const updateSql = `update grouplist set status = 1 where id = ${Math.abs(groupid)};`;
            await query(updateSql);
            
            await bot.editMessageText('初始化成功！现在可以设置操作人和汇率', {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
            });
        } else if (status == 1) {
            await bot.sendMessage(`-${groupid}`, '已经执行过开始了');
        }
    } catch (error) {
        console.error('创建表错误:', error.message);
        // 发送错误信息给群组
        try {
            await bot.sendMessage(`-${groupid}`, `初始化失败：${error.message}`);
        } catch (sendError) {
            console.error('发送错误消息失败:', sendError.message);
        }
    }
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
    var method = msg.data.split("huilvbuy_")[1];
    request({
        url: `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=sell&paymentMethod=${method}&userType=blockTrade&showTrade=false&receivingAds=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&urlId=2`,
        headers: constants.requestHeaders
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
    var method = msg.data.split("huilvsell_")[1];
    request({
        url: `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=${method}&userType=blockTrade`,
        headers: constants.requestHeaders
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