import PIL
from PIL import Image
import os
from numba import jit
# This code will work for equirectangular projection map and Mercator projection full map images
path = 'Latest-Map-Tiles'


@jit
def GenerateTiles(imageDir, minzoom, maxzoom, projection, path):
    cont = 0
    img = Image.open(imageDir)
    width, height = img.size

    if (projection == '4326'):
        if (width == 2*height or True):
            os.makedirs(path)
            for zoom in range(minzoom, maxzoom+1):
                pathZ = path+'/{z}'.format(z=zoom)
                os.makedirs(pathZ)
                for x in range(2**(zoom+1)):  # +1 for equirectangular projection
                    pathX = pathZ+'/{x}'.format(x=x)
                    os.makedirs(pathX)
                    for y in range(2**(zoom)):
                        # width and height of the tile
                        dy = height/(2**zoom)
                        dx = width/(2**(zoom+1))

                        left = dx*x
                        top = dy*y

                        right = left+dx
                        bottom = top+dy
                        imgcropped = img.crop((left, top, right, bottom))
                        tile = imgcropped.resize(
                            (256, 256), PIL.Image.ANTIALIAS)
                        tile.save(pathX+'/{y}.png'.format(y=y))
                print(f'zoom {zoom} is done #')

            else:
                print(
                    'please use map in equirectangular projection (2:1 width to height ratio)')

    elif (projection == '3857'):
        if (width == height or True):
            os.makedirs(path)
            for zoom in range(minzoom, maxzoom+1):
                pathZ = path+'/{z}'.format(z=zoom)
                os.makedirs(pathZ)
                for x in range(2**(zoom)):  # +1 for equirectangular projection
                    pathX = pathZ+'/{x}'.format(x=x)
                    os.makedirs(pathX)
                    for y in range(2**(zoom)):
                        # width and height of the tile
                        dy = height/(2**zoom)
                        dx = width/(2**zoom)

                        left = dx*x
                        top = dy*y

                        right = left+dx
                        bottom = top+dy
                        cont = +1
                        imgcropped = img.crop((left, top, right, bottom))
                        tile = imgcropped.resize(
                            (256, 256), PIL.Image.ANTIALIAS)
                        tile.save(pathX+'/{y}.png'.format(y=y))
                print(f'zoom {zoom} is done #')
        else:
            print('please use map in mercator projection (1:1 width to height ratio)')
    print('images number: '+cont)


#img=r"C:\Users\User\Desktop\Internships\Mars Research Project - NYUAD Internship\Mars Research NYUAD Internship\New Mars Maps\Mars Map Mercator.png"
# img='C:/Users/hp/Downloads/Full_map_photoshopped.tif'
img = 'To be used in Atlas.png'
# path='C:/Users/hp/Desktop/Tiles_4326'

# map image path, minzoom, maxzoom, map projection (3857,4326), the generated tiles file path
GenerateTiles(img, 0, 6, '4326', path)
