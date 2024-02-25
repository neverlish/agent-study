import sys
from PIL import Image, ImageDraw, ImageFont

# Adjust the defaults as needed to get the best performance for your use case
def add_alpha_numeric_grid_to_image(base_image_path, output_path, cell_size=50, grid_color='black', text_opacity=128, text_offset_x=5, label_background_color=(255, 255, 255, 128)):
    # Open the base image
    base_image = Image.open(base_image_path).convert("RGBA")

    # Create a new transparent image for the grid and text
    txt = Image.new('RGBA', base_image.size, (255, 255, 255, 0))


    # Get a drawing context for the grid and text overlay
    d = ImageDraw.Draw(txt)

    # Calculate the number of grid lines needed based on the cell size
    num_x_cells = base_image.width // cell_size
    num_y_cells = base_image.height // cell_size


    font_size = 10
    font = ImageFont.truetype("arial.ttf", font_size) # arial.ttf 글씨체, font_size=15

    # Define a function to convert the cell index to alphanumeric
    def to_alpha_numeric(index):
        if index < 1000:
            return f"{index:03d}"  # 3 digit number with leading zeros
        else:
            index -= 1000  # Adjust index as we start from 1000 for alphabetic
            return f"{chr(65 + index // 100)}{index % 100:02d}"  # Alphabetic prefix with 2 digit number

    # Draw the grid lines and the numbers
    for y in range(num_y_cells + 1):  # Include an extra cell for the partial row
        for x in range(num_x_cells + 1):  # Include an extra cell for the partial column
            # Calculate the position for each cell
            top_left_x = x * cell_size
            top_left_y = y * cell_size
            bottom_right_x = min(top_left_x + cell_size, base_image.width)  # Ensure we do not go beyond the image width
            bottom_right_y = min(top_left_y + cell_size, base_image.height)  # Ensure we do not go beyond the image height

            # Draw the semi-transparent background rectangle for the label
            d.rectangle([top_left_x, top_left_y, bottom_right_x, bottom_right_y], fill=label_background_color)

            # Drawing the grid lines
            d.rectangle([top_left_x, top_left_y, bottom_right_x, bottom_right_y], outline=grid_color)

            # Creating the alphanumeric label for each cell
            label = to_alpha_numeric(x + y * num_x_cells)

            # Calculate text position
            text_x = (top_left_x + bottom_right_x) / 2 - text_offset_x
            text_y = (top_left_y + bottom_right_y) / 2

            # Drawing the label in the middle of the cell, slightly shifted to the left
            d.text((text_x, text_y), f"{text_x}X{text_y}", fill=(0, 0, 0, text_opacity), font=font)

    # Composite the base image with the grid and text overlay
    combined = Image.alpha_composite(base_image, txt)

    # Save or show the final image
    combined = combined.convert("RGB")  # Remove alpha for saving in jpg format.
    combined.save(output_path)
    return

base_image_path = sys.argv[1]
output_path = sys.argv[2]
add_alpha_numeric_grid_to_image(base_image_path, output_path)
