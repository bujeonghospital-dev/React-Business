from pathlib import Path
import subprocess
output = subprocess.check_output(['git','show','HEAD:src/components/EditCustomerModal.tsx'], text=True)
lines = output.splitlines()
for i in range(1320, 1405):
    print(f"{i+1}: {lines[i]}")
