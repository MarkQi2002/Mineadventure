import cv2 # pip install opencv-python
import os
#img = cv2.imread("client/image/cut/Foods.png", cv2.IMREAD_UNCHANGED)

iconSize = [32,32] # x, y

count = 0

folder = "client/image/cut/"
for filename in os.listdir(folder):
    img = cv2.imread(os.path.join(folder,filename), cv2.IMREAD_UNCHANGED)
    if img is not None:
        theSize = img.shape
        for y in range(0, theSize[0], iconSize[1]):
            for x in range(0, theSize[1], iconSize[0]):
                print(x, y)
                cropped = img[y : y + iconSize[1], x : x + iconSize[0]]  # 裁剪坐标为[y0:y1, x0:x1]
                cv2.imwrite("client/image/new/" + str(count) + ".png", cropped)
                count += 1



