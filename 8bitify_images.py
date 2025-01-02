import cv2
import json


def pixelate(img_path: str, pixel_width: int, pixel_height: int = -1):
    # Input image
    input = cv2.imread(img_path)

    # Get input size
    height, width = input.shape[:2]

    # Desired "pixelated" size
    pixel_height = pixel_width if pixel_height == -1 else pixel_height

    # Resize input to "pixelated" size
    temp = cv2.resize(input, (pixel_width, pixel_height), interpolation=cv2.INTER_LINEAR)

    # Initialize output image
    output = cv2.resize(temp, (width, height), interpolation=cv2.INTER_NEAREST)

    cv2.imshow('Input', input)
    cv2.imshow('Output', output)

    cv2.waitKey(0)


if __name__ == '__main__':
    # pixelate("img.jpg", 100, 100)
    # pixelate("img2.png", 100, 100)
    # pixelate("img3.png", 100, 100)
    pixelate("img4.png", 100, 100)