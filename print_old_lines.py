from pathlib import Path
lines = Path('old_EditCustomerModal.tsx').read_text(encoding='utf-8').splitlines()
for i in range(470, 520):
    print(f"{i+1}: {lines[i]}")
