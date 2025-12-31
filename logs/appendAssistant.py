import json

# 读取日志
try:
    with open("logs.json", "r", encoding="utf-8") as f:
        logs = json.load(f)
except FileNotFoundError:
    logs = {}

last_version = "未公布"
last_contrib = "1304870761"

while True:
    
    version = input(f"请输入版本号 ({last_version}): ") or last_version
    last_version = version

    raw_page = input("请输入页码（输入-1删除该版本上一项）: ").strip()
    if not raw_page:
        print("未输入页码")
        continue

    try:
        page = int(raw_page)
        page1 = None
    except ValueError:
        page = 0
        page1 = raw_page

    if page == -1:
        if version in logs and logs[version]:
            logs[version].pop()
            print("删除上一项成功")
        else:
            print("该版本号无记录")
        with open("logs.json", "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
        continue

    try:
        update_type = int(input("请输入更新类型 (默认为0): ") or 0)
    except ValueError:
        update_type = 0

    contrib = input(f"请输入贡献者 ({last_contrib}): ") or last_contrib
    last_contrib = contrib

    pre_text = input("请输入此前文本: ")
    post_text = input("请输入此后文本: ")

    entry = {
        "page": page,
        "type": update_type,
        "contrib": contrib,
        "pre": pre_text,
        "post": post_text
    }

    if page1:
        entry["page1"] = page1

    if version not in logs:
        logs[version] = []

    logs[version].append(entry)

    with open("logs.json", "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4, ensure_ascii=False)

    print("添加成功")
