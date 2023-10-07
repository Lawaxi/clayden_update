import json

try:
    with open("logs.json", "r") as file:
        logs = json.load(file)
except FileNotFoundError:
    logs = {}

last_version = ""

while True:
    version = input(f"请输入版本号 ({last_version}): ") or last_version
    page = int(input("请输入页码: "))
    update_type = int(input("请输入更新类型 (默认为0): ") or 0)
    contrib = input("请输入贡献者 (默认为空字符串): ") or ""
    pre_text = input("请输入此前文本: ")
    post_text = input("请输入此后文本: ")

    last_version = version
    
    new_entry = {"page": page, "type": update_type, "contrib": contrib, "pre": pre_text, "post": post_text}

    if version not in logs:
        logs[version] = []

    logs[version].append(new_entry)

    with open("logs.json", "w") as file:
        json.dump(logs, file, indent=4)

    print("添加成功")
