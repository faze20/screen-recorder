# Icon System

This document describes the icon system used in FocusRecord.

## Overview

The app uses [lucide-react](https://lucide.dev/) for all icons. A centralized `Icon` component (`src/components/ui/Icon.jsx`) provides a consistent API and maps legacy material-symbols names to lucide icons.

## Usage

```jsx
import { Icon } from '../components/ui/Icon';

// Basic usage
<Icon name="play" size={20} />

// With custom styling
<Icon name="videocam" size={24} className="text-primary" />

// Supported name formats:
// - material-symbols style: "play_arrow", "content_cut", "zoom_in"
// - lucide style: "play", "scissors", "zoom-in"
```

## Props

| Prop          | Type     | Default | Description                   |
| ------------- | -------- | ------- | ----------------------------- |
| `name`        | `string` | -       | Icon name (see mapping below) |
| `size`        | `number` | `20`    | Icon size in pixels           |
| `className`   | `string` | `''`    | Additional CSS classes        |
| `strokeWidth` | `number` | `2`     | SVG stroke width              |

## Icon Mapping

The component accepts both material-symbols-style names and lucide names:

### Playback

| Name                   | Icon          |
| ---------------------- | ------------- |
| `play`, `play_arrow`   | Play triangle |
| `pause`                | Pause bars    |
| `stop`                 | Stop square   |
| `skip_previous`        | Skip back     |
| `skip_next`            | Skip forward  |
| `radio_button_checked` | Record dot    |
| `stop_circle`          | Stop circle   |

### Media

| Name                                     | Icon              |
| ---------------------------------------- | ----------------- |
| `mic`, `mic_off`                         | Microphone        |
| `videocam`, `videocam_off`               | Camera            |
| `desktop_windows`, `monitor`             | Screen/monitor    |
| `screen_share`, `stop_screen_share`      | Screen sharing    |
| `volume_up`, `volume_down`, `volume_off` | Volume levels     |
| `cast`                                   | Cast/share screen |

### Edit

| Name                             | Icon             |
| -------------------------------- | ---------------- |
| `content_cut`, `scissors`, `cut` | Scissors         |
| `content_copy`, `copy`           | Copy             |
| `content_paste`, `paste`         | Paste            |
| `undo`, `redo`                   | Undo/Redo arrows |
| `delete`, `trash`                | Trash can        |
| `edit`, `pencil`                 | Pencil           |
| `text`, `title`                  | Text/type        |
| `crop`                           | Crop tool        |
| `move`, `pan_tool`               | Move cursor      |
| `select`, `arrow_selector_tool`  | Select cursor    |

### Zoom & Screen

| Name                       | Icon             |
| -------------------------- | ---------------- |
| `zoom_in`, `zoom_out`      | Magnifying glass |
| `fit_screen`, `fullscreen` | Maximize         |
| `fullscreen_exit`          | Minimize         |

### Navigation

| Name                            | Icon              |
| ------------------------------- | ----------------- |
| `chevron_left`, `chevron_right` | Chevron arrows    |
| `expand_more`, `expand_less`    | Up/down chevrons  |
| `arrow_back`, `arrow_forward`   | Left/right arrows |
| `close`, `x`                    | X close           |

### General

| Name                   | Icon             |
| ---------------------- | ---------------- |
| `add`, `plus`          | Plus sign        |
| `remove`, `minus`      | Minus sign       |
| `check`, `done`        | Checkmark        |
| `search`, `search_off` | Search magnifier |
| `settings`             | Settings gear    |
| `tune`, `sliders`      | Sliders/filter   |
| `info`, `help`         | Info circle      |
| `error`, `warning`     | Alert icons      |

### Files

| Name                                  | Icon                   |
| ------------------------------------- | ---------------------- |
| `download`, `upload`                  | Download/upload arrows |
| `cloud_upload`                        | Cloud upload           |
| `save`                                | Save/disk              |
| `folder`, `folder_open`               | Folder                 |
| `movie`, `video_file`                 | Video file             |
| `link`                                | Link chain             |
| `drive_file_rename_outline`, `rename` | Rename/pencil          |

### UI

| Name                                 | Icon           |
| ------------------------------------ | -------------- |
| `home`                               | Home           |
| `person`, `user`                     | User avatar    |
| `group`, `people`                    | Users group    |
| `more_horiz`, `more_vert`            | More dots      |
| `menu`                               | Hamburger menu |
| `visibility`, `visibility_off`       | Eye            |
| `lock`, `lock_open`                  | Lock           |
| `shield`                             | Shield         |
| `notifications`, `notifications_off` | Bell           |
| `collections_bookmark`, `bookmark`   | Bookmark       |

### Layout

| Name           | Icon         |
| -------------- | ------------ |
| `dashboard`    | Layout grid  |
| `aspect_ratio` | Aspect ratio |
| `layers`       | Layers       |

### Special

| Name                        | Icon           |
| --------------------------- | -------------- |
| `effects`, `sparkles`       | Sparkles       |
| `palette`                   | Color palette  |
| `refresh`                   | Refresh arrows |
| `analytics`                 | Bar chart      |
| `extension`, `integrations` | Puzzle piece   |

## Unknown Icons

If an unknown icon name is used:

1. In development: A warning is logged to the console
2. A fallback `HelpCircle` icon is rendered

## Adding New Icons

1. Import the icon from `lucide-react`
2. Add the mapping to `ICON_MAP` in `src/components/ui/Icon.jsx`
3. Update this documentation

Example:

```jsx
import { NewIcon } from 'lucide-react';

const ICON_MAP = {
  // ...existing icons
  new_icon_name: NewIcon,
};
```

## Direct Imports

For special cases, icons can be imported directly:

```jsx
import { Play, Pause, Mic } from '../components/ui/Icon';
```

However, using the `<Icon name="..." />` component is preferred for consistency.
