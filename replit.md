# Mini Hospital Management System

## Overview

A collection of three standalone static HTML applications:

- **index.html** — Mini Hospital Management System: add patients, doctors, and schedule appointments. Data is persisted in browser localStorage.
- **to do.html** — To-Do List app with add, edit, delete, and checkbox completion. Data is persisted in browser localStorage.
- **unit.html** — Unit Converter supporting temperature, length, mass, volume, time, and energy conversions.

## Tech Stack

- Pure HTML, CSS, and vanilla JavaScript
- Tailwind CSS (CDN) used in index.html
- No build system, no backend, no package manager

## Running the Project

The project is served with Python's built-in HTTP server:

```
python3 -m http.server 5000 --bind 0.0.0.0
```

This is configured as the "Start application" workflow on port 5000.

## Deployment

Configured as a static deployment with the root directory as the public directory.
