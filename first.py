#1

# print("минимальное значение: ", min(int(input()),int(input()),int(input())))

#2

# arr = [int(input()),int(input()),int(input())]
# print(*[i if i>0 else i*i for i in arr],sep=", ")

#3
# R = float(input())
# S = float(input())
# import math
# if R >= math.pi*(S/2):
#     print("Поместится")
# else:
#     print("Не поместится")

# #4
# F = int(input())
# M = int(input())
# if F==M/2+7:
#     print("Возраст подходит")
# else:
#     print("Возраст не подходит")


#5          1               2           3
# arr = [int(input()),int(input()),int(input())]

# while arr[1] == arr[0] and arr[1] == arr[2]:
#     arr[1] = int(input("введите другой y"))

# while arr[2] in [arr[0],arr[1]]:
#     arr[2] = int(input("введите другой z"))

# x = sum(arr)
# if x<1:
#     m = min(arr)
#     res= (x-m)/2
#     arr[arr.index(m)] = res

# print(arr)


# if Y!=X and Y!=Z:
#     if X+Y+Z<1:
#         minn = min(arr)


# #6
# X = int(input())
# Y = int(input())
# arr = []



# if X>Y:
# Y+=X
# X-=Y
# arr.append(X)
# arr.append(Y)
# elif X<Y:
# X+=Y
# Y-=X
# arr.append(X)
# arr.append(Y)
# else:
# print("значения равны")
# print(arr)








# minn = min(arr)
# minn = X+Y
# arr.append(minn)
# maxx = max(arr)
# maxx =

# 10
x = int(input())
if x > 1000:
    x = x - (5*x/100)
elif x > 500:
    x = x - (3*x/100)
print(x)


# 14
print("чёт" if int(input())%2 == 0 else "нечёт")


