import os

def repair():
    path = 'src/app/admin/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        # Detect the corrupted line with literal \n
        if 'const postId = (rawPayload as Post).id;\\n' in line:
            # Split it properly
            parts = line.split('\\n')
            for part in parts:
                new_lines.append(part.strip() + '\n')
        elif 'const { id: _ignoredId' in line and '\\n' in line:
            parts = line.split('\\n')
            for part in parts:
                new_lines.append(part.strip() + '\n')
        else:
            new_lines.append(line)

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print("Repair 3.0: Lines split correctly.")

if __name__ == "__main__":
    repair()
