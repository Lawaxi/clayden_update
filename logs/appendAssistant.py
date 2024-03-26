import json

try:
    with open("logs.json", "r", encoding='utf-8') as file:
        logs = json.load(file)
except FileNotFoundError:
    logs = {}

last_version = "未公布"
last_contrib = "1304870761"

while True:
    version = input(f"请输入版本号 ({last_version}): ") or last_version
    last_version = version
    
    page = int(input("请输入页码: "))
    if not page:
        print("未输入页码")
        continue
    elif page == -1 and version in logs:
        logs[version] = logs[version][:-1]
        print("删除上一项成功")
    elif page == -1:
        print("该版本号无记录")
        continue
    else:    
        update_type = int(input("请输入更新类型 (默认为0): ") or 0)
        contrib = input(f"请输入贡献者 ({last_contrib}): ") or last_contrib
        pre_text = input("请输入此前文本: ")
        post_text = input("请输入此后文本: ")

        last_contrib = contrib
        
        new_entry = {"page": page, "type": update_type, "contrib": contrib, "pre": pre_text, "post": post_text}

        if version not in logs:
            logs[version] = []

        logs[version].append(new_entry)
        print("添加成功")

    with open("logs.json", "w") as file:
        json.dump(logs, file, indent=4)

