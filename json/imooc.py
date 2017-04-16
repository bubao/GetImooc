#!/usr/bin/env python
# -*- coding: utf-8 -*-
__version__ = '2.0.0'

import re
import json
import requests
from bs4 import BeautifulSoup
try:
    import urlparse
except Exception:
    import urllib.parse as urlparse
import sys

try:
    reload(sys)
    sys.setdefaultencoding("utf-8")
except Exception:
    pass

imooc_url = 'http://www.imooc.com/course/programdetail/pid/{page_num}'


# 保存成json
def save_to_json(name, data):
    p = re.compile('\s+')
    jsobj = json.dumps(data)
    try:
        file = open(name, 'wb')
        text = jsobj.decode("unicode-escape").decode("unicode-escape").replace('\"', '`').replace('\'', '\"')[1:-1].replace('u"', '"').replace('`', '"').replace('\"S\"', '\'S\'').replace('t\"s', 't\'s').replace('\"换\"', '\'换\'').replace('\"老朋友\"', '\'老朋友\'').replace('\"绑\"', '\'绑\'').replace('\"网页常用特效\"', '\'网页常用特效\'')
        text = re.sub(p, '', text)
        file.write(text)
    except Exception:
        file = open(name, 'w')
        text = jsobj.encode('utf-8').decode("unicode-escape").replace('\"', '`').replace('\'', '\"')[1:-1].replace('u"', '"').replace('`', '"').replace('\"S\"', '\'S\'').replace('t\"s', 't\'s').replace('\"换\"', '\'换\'').replace('\"老朋友\"', '\'老朋友\'').replace('\"绑\"', '\'绑\'').replace('\"网页常用特效\"', '\'网页常用特效\'')
        text = re.sub(p, '', text)
        file.write(text)
    finally:
        file.close()


def get_course_data(li, save_map, level_dict, resp):
    # 获取每个分类下的全部课程信息
    divs = li.find_all('div', {'class': 'index-card-container'})
    if isinstance(divs, list):
        for div in divs:
            course_list = list()
            a = div.find('a', {'class': 'course-card'})
            href = urlparse.urljoin(resp.url, a['href'])
            name = a.find('h3', {'class': 'course-card-name'}).text
            content = a.find('p')['title']
            info = a.find('div', {'class': 'course-card-info'}).text

            course_list.append(href)
            course_list.append(name)
            course_list.append(content)
            course_list.append(info)
            level_dict['course_list'].append(course_list)
    save_map['course'].append(level_dict)


def start(page_num):
    # 每个路径的全部内容
    save_map = dict()

    resp = requests.get(imooc_url.format(page_num=page_num))
    if resp.status_code != 200:
        return
    soup = BeautifulSoup(resp.text, 'html.parser')

    # 每个级别对应的li
    lis = soup.find_all('li', {'class': 'step-item'})

    course_title = soup.find('div', {'class': 'plan-top'})

    # 路径名：如Java工程师
    h2_title = course_title.find('h2').text
    html_tags = course_title.find('span', {'class': 'meta-tags'})
    # 课程数
    course_count = course_title.find('span', {'class': 'meta-course'}).text
    # 学习人数
    learn_count = course_title.find('span', {'class': 'meta-member'}).text

    # 分类：如 Java 小白 求职
    course_tags = list()
    if html_tags:
        tags = html_tags.find_all('span', {'class': 'g-tag'})
        for tag in tags:
            course_tags.append(tag.text)

    save_map['title'] = h2_title
    save_map['tags'] = course_tags
    save_map['course_count'] = course_count
    save_map['learn_count'] = learn_count
    save_map['course'] = list()

    for li in lis:
        if li.find('div', {'class': 'bd l clearfix'}):
            # 路径大的分类，如：入门必学，Web初识
            # 获取课程所有的分类
            levels = li.find('div', {'class': 'bd l clearfix'}).find_all('a', {'class': 'step-anchor'})
            for level in levels:
                level_dict = dict()
                # 大分类下的小类别，如语法基础，面向对象
                level_title = level.find('b').text
                # 大分类下小类别的详细信息，如：环境搭建，开发工具使用，基础语法
                level_info = level.find('span', {'class': 'rule'}).text

                level_dict['level_title'] = level_title
                level_dict['level_info'] = level_info
                level_dict['course_list'] = list()
                # 获取每个分类下的全部课程信息
                get_course_data(li, save_map, level_dict, resp)
        else:
            # 有的路径和Java，PHP这种大路径略有不同
            level_dict = dict()
            level_title = li.find('h4').text
            level_info = li.find('p', {'class': 'autowrap'}).text
            level_dict['level_title'] = level_title
            level_dict['level_info'] = level_info
            level_dict['course_list'] = list()
            get_course_data(li, save_map, level_dict, resp)

    save_map = str(save_map)
    save_to_json('{0}.json'.format(h2_title), save_map)
    print("下载完成：{0} -- {1}".format(page_num, h2_title))


if __name__ == '__main__':
    for i in range(120):
        start(i)
