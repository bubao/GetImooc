let fs = require("fs")
let glob = require("glob")
let Afiles = 'json/*.json'
let Mfiles = 'Hexo/*.md'
var fn //文件名
var Mtitle //MD名
var course_count //课程总数
var Mlevel_title //MD章
var Mlevel_info //MD 章简介
var courseI //课程
var Mcourse_list0 //节 url
var Mcourse_list1 //MD 节
var Mcourse_list2 //节说明

/**
 * date
 */

var d = new Date()
var year = d.getFullYear()
var day = d.getDate()
var month = d.getMonth() + 1
var hours = d.getHours()
var minutes = d.getMinutes()
var seconds = d.getSeconds()

var date = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds


/**
 * hexo
 */

var hexo
var hexo_ = "---\n\n"
var hexo_title = "title: "
var h_title
var hexo_date = "\ndate: "
var h_date
var hexo_tags = "\ntags: "
var h_tags
var hexo_toc = "[TOC]\n"
var h_toc
var hexo_categories = "categories: "
var h_categories
var foot = ">数据来源于`慕课网`，由`程序员的萌工厂`整理发布，QQ群：300421872"


fs.exists('Hexo', function(exists) {
	if (exists)
		console.log('Hexo文件夹存在');
	else {
		fs.mkdir('Hexo', function(err) {
			if (err)
				console.error(err);
			console.log('创建Hexo文件夹成功');
		})
	}

});



function touchMD(fn) {

	var readall = JSON.parse(fs.readFileSync(fn, "utf-8"));

	/**
	 * 读取完毕 
	 */

	fn = fn.replace('.json', '').replace('json/', '');


	//创建文件夹

	fs.writeFile('./Hexo/' + fn + '.md', "", function(err) {
		if (err) throw err;
		console.log("文档名：" + fn);
	})

	/**
	 * 需要追加 hexo 的头
	 * 包含如下
	 * ---
	 * title: name
	 * date: 2017-04-15 00:10:05
	 * tags:
	 * ---
	 */

	course_count = '>' + readall.course_count + '\n';
	h_title = hexo_title + readall.title;
	h_date = hexo_date + date;
	h_tags = hexo_tags + '[' + readall.tags.map(n => ("\"" + n + "\"")) + ']' + '\n';
	h_categories = hexo_categories + "\"路径\"\n";
	hexo = hexo_ + h_title + h_date + h_tags + h_categories + hexo_;
	toc = hexo_toc + '\n<!--more-->\n'
	fs.appendFileSync('./Hexo/' + fn + '.md', hexo + course_count + toc, function(err) {
		if (err) throw err;
	});

	// MD的title，如果是hexo模板，这个可以不要了
	// Mtitle = '# ' + readall.title + '\n\n';

	// 追加 MD的title
	// fs.appendFile('./MD/' + fn + '.md', Mtitle, function(err) {
	// 	if (err) throw err;
	// 	console.log("文档title:" + fn + "成功保存");
	// });
	// end

	//循环加入课程

	for (let i = 0; i <= readall.course.length - 1; i++) {
		courseI = readall.course[i];

		/**
		 * Mlevel_title
		 * 第 i 章 的章名
		 * Mlevel_info
		 * 第 i 章 的章名简介
		 */

		Mlevel_title = '## ' + courseI.level_title + '\n\n'
		Mlevel_info = '> ' + courseI.level_info + '\n\n'
		fs.appendFile('./Hexo/' + fn + '.md', Mlevel_title + Mlevel_info, function(err) {
			if (err) throw err;
		});

		/**
		 * 在此要加入课程网址
		 * courseI.course_list[j][0]
		 * 第 i 章 第j节 的网址
		 * courseI.course_list[j][1]
		 * 第 i 章 第j节 的节名
		 * courseI.course_list[j][2]
		 * 第 i 章 第j节 的简介
		 */

		for (var j = 0; j <= courseI.course_list.length - 1; j++) {
			Mcourse_list1 = courseI.course_list[j][1]
			Mcourse_list0 = '### ' + '[' + Mcourse_list1 + ']( ' + courseI.course_list[j][0] + ')\n\n'
			Mcourse_list2 = courseI.course_list[j][2] + '\n\n'
			fs.appendFile('./Hexo/' + fn + '.md', Mcourse_list0 + Mcourse_list2, function(err) {
				if (err) throw err;
			});
		}
	}

	/**
	 * 判断是否写完，追加注脚
	 * 由于j泄漏导致注脚无法追加在最末尾，已移出到glob中，此处已作废
	 */

	// if (j = courseI.course_list.length) {
	// 	fs.appendFile('./MD/' + fn + '.md', foot, function(err) {
	// 		if (err) throw err;
	// 		console.log("注脚成功保存");
	// 	});
	// }
}

glob(Afiles, 'utf-8', function(err, afiles) {
	if (err) throw err;
	//生成MD
	for (let k = 0; k <= afiles.length - 1; k++) {
		touchMD(afiles[k])
	}
	//追加注脚
	glob(Mfiles, 'utf-8', function(err, mfiles) {
		if (err) {
			throw err;
		} else if (mfiles.length === afiles.length) {
			for (let l = 0; l <= mfiles.length - 1; l++) {
				mfiles[l] = mfiles[l].replace('.md', '').replace('Hexo/', '');
				fs.appendFile('./Hexo/' + mfiles[l] + '.md', foot, function(err) {
					if (err) throw err;
					if (l == mfiles.length - 1) {
						console.log('全部文件数量为：' + mfiles.length + "，保存在Hexo文件夹中！")
					}
				});
			}
		}
	});
});
// if ( mfiles.length=== files.length) {
// 	fs.appendFile('./MD/' + mfiles + '.md', foot, function(err) {
// 		if (err) throw err;
// 		console.log("注脚成功保存");
// 	});
// }
// touchMD("./json/C++远征攻略.json")

/**
 * touchMD：生成 MD文档
 * 
 * version:v1.0.2
 * 
 * use:
 * npm i
 * node index.js
 * 
 * change:
 *  1. 添加注脚
 *  2. 分离`touchMD`和`glob`
 */