import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as mpatches
from matplotlib import image as mpimg
import os
import glob

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'SimHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# 读取Excel数据
df = pd.read_excel('原始数据.xlsx', sheet_name='Sheet1', header=None)

# 提取温度数据（20℃, 25℃, 30℃, 35℃, 40℃）
# 数据在行2-4（索引1-3），列1-5
temp_data = {}
temp_cols = [1, 2, 3, 4, 5]  # 对应20℃, 25℃, 30℃, 35℃, 40℃的列
temp_labels = ['20℃', '25℃', '30℃', '35℃', '40℃']

for i, col_idx in enumerate(temp_cols):
    temp_values = []
    for row in range(2, 5):  # sample 1, 2, 3 (行索引2, 3, 4)
        val = df.iloc[row, col_idx]
        if pd.notna(val) and isinstance(val, (int, float)):
            temp_values.append(float(val))
    if temp_values:
        temp_data[temp_labels[i]] = temp_values

# 提取pH数据（pH 3, 5, 7, 9, 11）
# 数据在行13-15（索引12-14），列1-5
pH_data = {}
pH_cols = [1, 2, 3, 4, 5]  # 对应pH 3, 5, 7, 9, 11的列
pH_labels = ['3', '5', '7', '9', '11']

for i, col_idx in enumerate(pH_cols):
    pH_values = []
    for row in range(13, 16):  # sample 1, 2, 3 (行索引13, 14, 15)
        val = df.iloc[row, col_idx]
        if pd.notna(val) and isinstance(val, (int, float)):
            pH_values.append(float(val))
    if pH_values:
        pH_data[pH_labels[i]] = pH_values

# 计算统计值
temp_means = [np.mean(temp_data[label]) for label in temp_labels]
temp_stds = [np.std(temp_data[label], ddof=1) for label in temp_labels]

pH_means = [np.mean(pH_data[label]) for label in pH_labels]
pH_stds = [np.std(pH_data[label], ddof=1) for label in pH_labels]

# 创建图表
fig = plt.figure(figsize=(16, 10))

# Panel A: 培养皿图片
# 尝试加载实际的培养皿图片，如果没有则使用占位符
ax_a = plt.subplot(2, 3, (1, 2))
ax_a.axis('off')
ax_a.text(0.02, 0.98, 'A', transform=ax_a.transAxes, 
          fontsize=20, fontweight='bold', va='top')

temp_labels_short = ['20℃', '25℃', '30℃', '35℃', '40℃']
temp_numbers = ['20', '25', '30', '35', '40']

# 查找培养皿图片文件（支持多种格式和命名方式）
image_files = {}
for temp_num in temp_numbers:
    # 尝试多种可能的文件名模式
    patterns = [
        f'*{temp_num}*.*',
        f'*{temp_num}C*.*',
        f'*temp{temp_num}*.*',
        f'*T{temp_num}*.*',
        f'*{temp_num}度*.*',
    ]
    for pattern in patterns:
        matches = glob.glob(pattern, root_dir='.')
        if matches:
            # 检查是否是图片文件
            for match in matches:
                if match.lower().endswith(('.png', '.jpg', '.jpeg', '.tif', '.tiff')):
                    image_files[temp_num] = match
                    break
            if temp_num in image_files:
                break

# 创建5个培养皿展示区域
for i, (temp, temp_num) in enumerate(zip(temp_labels_short, temp_numbers)):
    x_pos = 0.1 + i * 0.18
    y_pos = 0.5
    
    if temp_num in image_files:
        # 加载并显示实际图片
        try:
            img = mpimg.imread(image_files[temp_num])
            # 创建图片显示区域
            img_extent = [x_pos - 0.08, x_pos + 0.08, y_pos - 0.08, y_pos + 0.08]
            ax_a.imshow(img, extent=img_extent, aspect='auto', zorder=1)
            # 添加边框
            rect = plt.Rectangle((x_pos - 0.08, y_pos - 0.08), 0.16, 0.16,
                               fill=False, edgecolor='black', linewidth=2, zorder=2)
            ax_a.add_patch(rect)
        except Exception as e:
            print(f"警告: 无法加载图片 {image_files[temp_num]}: {e}")
            # 如果加载失败，使用占位符
            circle = plt.Circle((x_pos, y_pos), 0.08, fill=True, 
                               facecolor='lightgray', edgecolor='black', linewidth=2)
            ax_a.add_patch(circle)
            ax_a.text(x_pos, y_pos, '图片', ha='center', va='center', fontsize=9, 
                     color='gray', style='italic')
    else:
        # 使用占位符
        circle = plt.Circle((x_pos, y_pos), 0.08, fill=True, 
                           facecolor='lightgray', edgecolor='black', linewidth=2)
        ax_a.add_patch(circle)
        ax_a.text(x_pos, y_pos, '图片', ha='center', va='center', fontsize=9, 
                 color='gray', style='italic')
    
    # 添加温度标签
    ax_a.text(x_pos, 0.35, temp, ha='center', va='top', fontsize=11, fontweight='bold')

ax_a.set_xlim(0, 1)
ax_a.set_ylim(0, 1)
ax_a.text(0.5, 0.85, '不同温度对致病菌生长的影响', ha='center', va='bottom', 
          fontsize=12, fontweight='bold')

# Panel B: 温度对菌落直径的柱状图
ax_b = plt.subplot(2, 3, 4)
x_pos = np.arange(len(temp_labels))
bars = ax_b.bar(x_pos, temp_means, yerr=temp_stds, capsize=5, 
                color='steelblue', edgecolor='black', linewidth=1.5, width=0.6,
                error_kw={'elinewidth': 1.5, 'capthick': 1.5})
ax_b.set_xlabel('温度', fontsize=12, fontweight='bold')
ax_b.set_ylabel('菌落直径(cm)', fontsize=12, fontweight='bold')
ax_b.set_xticks(x_pos)
ax_b.set_xticklabels(temp_labels, fontsize=11)
ax_b.set_ylim(0, 8)
ax_b.set_yticks(np.arange(0, 9, 2))
ax_b.grid(axis='y', alpha=0.3, linestyle='--', linewidth=0.8)
ax_b.text(-0.15, 0.98, 'B', transform=ax_b.transAxes, 
          fontsize=18, fontweight='bold', va='top')
ax_b.spines['top'].set_visible(False)
ax_b.spines['right'].set_visible(False)
ax_b.spines['left'].set_linewidth(1.5)
ax_b.spines['bottom'].set_linewidth(1.5)

# Panel C: pH对质量的线状图
ax_c = plt.subplot(2, 3, 5)
pH_numeric = [float(p) for p in pH_labels]
ax_c.errorbar(pH_numeric, pH_means, yerr=pH_stds, marker='o', 
              markersize=8, capsize=5, capthick=1.5, linewidth=2.5,
              color='darkgreen', markerfacecolor='lightgreen', 
              markeredgecolor='darkgreen', markeredgewidth=2,
              errorevery=1, elinewidth=1.5)
ax_c.set_xlabel('pH', fontsize=12, fontweight='bold')
ax_c.set_ylabel('质量(g)', fontsize=12, fontweight='bold')
ax_c.set_xticks(pH_numeric)
ax_c.set_ylim(0, 5)
ax_c.set_yticks(np.arange(0, 6, 1))
ax_c.grid(alpha=0.3, linestyle='--', linewidth=0.8)
ax_c.text(-0.15, 0.98, 'C', transform=ax_c.transAxes, 
          fontsize=18, fontweight='bold', va='top')
ax_c.spines['top'].set_visible(False)
ax_c.spines['right'].set_visible(False)
ax_c.spines['left'].set_linewidth(1.5)
ax_c.spines['bottom'].set_linewidth(1.5)

# 调整布局
plt.tight_layout()

# 保存为PDF
plt.savefig('figure_output.pdf', dpi=300, bbox_inches='tight', format='pdf')
print("图表已保存为 figure_output.pdf")

# 也保存为PNG以便预览
plt.savefig('figure_output.png', dpi=300, bbox_inches='tight')
print("图表预览已保存为 figure_output.png")

plt.close()

# 打印数据摘要
print("\n数据摘要:")
print("\n温度数据 (菌落直径 cm):")
for label, mean, std in zip(temp_labels, temp_means, temp_stds):
    print(f"  {label}: {mean:.2f} ± {std:.2f}")

print("\npH数据 (质量 g):")
for label, mean, std in zip(pH_labels, pH_means, pH_stds):
    print(f"  pH {label}: {mean:.2f} ± {std:.2f}")

