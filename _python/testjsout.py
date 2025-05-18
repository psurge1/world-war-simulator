

linesJS = []
with open ('data2.csv', 'r') as f:
    linesJS = f.readlines()

linesPY = []
with open ('data2py.csv', 'r') as f:
    linesPY = f.readlines()

assert len(linesJS) == len(linesPY), f"Length mismatch: {len(linesJS)} != {len(linesPY)}"

mismatch_count = 0
element = 4
mismatch_count = 0

py_pix_count = 0
js_pix_count = 0

for i in range(len(linesJS)):
    lineJS = linesJS[i].strip().split(",")
    linePY = linesPY[i].strip().split(",")
    if linePY[element] != "-1":
        py_pix_count += 1
    if lineJS[element] != "-1":
        js_pix_count += 1

    if lineJS[element] != linePY[element]:
        print(lineJS[element], linePY[element])
        mismatch_count += 1
        print(f"Line {i+1} mismatch:")
        print(f"JS: {lineJS}")
        print(f"PY: {linePY}")
        print()
print(f"Element {element}\nMismatch count: {mismatch_count}\nTotal lines: {len(linesJS)}\n")
print(f"PY pixel count: {py_pix_count}")
print(f"JS pixel count: {js_pix_count}")

# strs = set()
# num_dup = 0
# for i in range(len(linesJS)):
#     lineJS = linesJS[i].strip().split(",")
#     # linePY = linesPY[i].strip().split(",")
#     inq = "" + lineJS[-2] + lineJS[-1]
#     if inq == "-1-1":
#         continue
#     if inq in strs:
#         print("DUPLICATE FOUND")
#         print(inq)
#         num_dup += 1
#     else:
#         strs.add(inq)