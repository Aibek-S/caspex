CaspX Backend Context
О проекте
CaspX (Caspian Exchange) — логистическая платформа для Мангистауской области.
Основная цель:
Объединить в одной системе:
Отправителей грузов
Перевозчиков
Администрацию (Акимат)
Платформа должна помогать искать перевозчиков, строить маршруты, показывать логистическую загруженность региона и предоставлять аналитику.

Технологический стек
Backend
NestJS
TypeScript
PostgreSQL
Prisma ORM
JWT Authentication
Swagger
Axios
class-validator
class-transformer
AI
OpenAI API
Внешние сервисы
OpenWeatherMap API
OpenRouteService API
OpenStreetMap
Qoldau / CarGoRuqsat API

Роли пользователей
CLIENT
Отправитель груза.
Может быть:
физлицо
ИП
компания
Функционал одинаковый.

CARRIER
Перевозчик.
Может быть:
водитель грузовика
морской перевозчик
железнодорожный перевозчик
Все объединены в одну роль.

ADMIN
Акимат / аналитическая панель.
Доступ только к аналитике.

Основные сущности БД
User
id
email
passwordHash
role

firstName
lastName
phone

avatarUrl

companyName
companyLogo

city
country

createdAt
updatedAt
Role:
CLIENT
CARRIER
ADMIN

CarrierProfile
Создается после нажатия:
"Стать перевозчиком"
id

userId

experienceYears

transportType

description

isApproved

createdAt

Vehicle
id

carrierId

type

brand

model

year

plateNumber

capacityTons

cargoVolume

vehicleImageUrl

Order
Основная сущность.
id

clientId

title

cargoType

weight

volume

origin

destination

comment

estimatedPrice

estimatedDeliveryTime

estimatedCarrierSearchTime

status

createdAt
updatedAt
Status:
NEW

SEARCHING_CARRIER

CARRIER_ASSIGNED

IN_TRANSIT

DELIVERED

CANCELLED

Route
id

orderId

distanceKm

estimatedHours

geometry

createdAt
geometry хранит маршрут.

RouteSegment
Для мультимодальной логистики.
Например:
Актау → Курык → Баку
id

routeId

transportMode

from

to

position
transportMode:
ROAD
SEA
RAIL

OrderTracking
История статусов.
id

orderId

status

location

timestamp

AnalyticsRecord
Для дашборда.
id

date

totalOrders

activeCarriers

cargoVolume

averageDeliveryTime

averageWaitingTime

AiPrediction
id

orderId

predictionType

inputData

result

createdAt

Основные модули NestJS
src

auth/
users/
carrier/
vehicles/
orders/
routes/
tracking/
analytics/
ai/
external/
prisma/

Auth Module
JWT авторизация.
Endpoints:
POST /auth/register
POST /auth/login
GET /auth/me

Users Module
GET /users/me
PATCH /users/me

Carrier Module
POST /carrier/apply

GET /carrier/profile

PATCH /carrier/profile

Vehicles Module
POST /vehicles

GET /vehicles

PATCH /vehicles/:id

DELETE /vehicles/:id

Orders Module
POST /orders

GET /orders

GET /orders/:id

PATCH /orders/:id

DELETE /orders/:id

Carrier Orders
GET /orders/available

POST /orders/:id/accept

POST /orders/:id/start

POST /orders/:id/deliver

Routes Module
Использует OpenRouteService.
POST /routes/calculate
Вход:
{
  "origin": "Aktau",
  "destination": "Baku"
}
Выход:
{
  "distance": 730,
  "duration": 12
}

Tracking Module
POST /tracking/update

GET /tracking/order/:id

Analytics Module
Для ADMIN.
GET /analytics/dashboard

GET /analytics/orders

GET /analytics/ports

GET /analytics/checkpoints

AI Module
Использует OpenAI.
Функции:
AI Logistics Assistant
POST /ai/logistics
Пример:
{
  "message": "Когда лучше отправить груз из Актау в Баку?"
}

Route Recommendation
POST /ai/recommend-route

Congestion Prediction
POST /ai/predict-congestion

Analytics Explanation
POST /ai/analyze

Интеграции
OpenWeatherMap
Использовать для влияния погоды на логистику.
Пример:
Шторм
Сильный ветер
Высокая температура

OpenRouteService
Использовать для:
маршрутов
расстояний
ETA

Qoldau / CarGoRuqsat API
Использовать для:
очередей на КПП
загрузки КПП
анализа сухопутных перевозок

Что НЕ делать сейчас
Не реализовывать:
оплату
документы
электронную подпись
реальные GPS трекеры
SMS
чат между пользователями
файловое хранилище
Это не нужно для MVP хакатона.

Цель MVP
Должен работать следующий сценарий:
Пользователь регистрируется.
Создает заказ.
Получает примерную стоимость и маршрут.
Перевозчик видит заказ.
Принимает заказ.
Меняет статусы доставки.
Пользователь отслеживает груз.
AI дает рекомендации.
Акимат видит аналитику в Dashboard.