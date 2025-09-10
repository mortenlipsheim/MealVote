# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Adding a New Language

Adding a new language requires making small changes to five different files. Here is a step-by-step guide to add a new language, using Polish (`pl`) as an example.

1.  **Create the Translation File**:
    *   Create a new file: `src/messages/pl.json`.
    *   The easiest way to start is to copy the contents of `src/messages/en.json` and translate all the text values into Polish.

2.  **Update Internationalization Config (`src/i18n.ts`)**:
    *   Add the new language code to the `locales` array.
    *   `const locales = ['en', 'de', 'fr', 'es', 'it', 'nl', 'no', 'sv', 'da', 'fi', 'pl'];`

3.  **Update Navigation Config (`src/navigation.ts`)**:
    *   Add the new language code to the `locales` array here as well.
    *   `export const locales = ['en', 'de', 'fr', 'es', 'it', 'nl', 'no', 'sv', 'da', 'fi', 'pl'] as const;`
    *   Add the translated path for any dynamic routes. For the voting page, you would add:
    *   `es: '/votar/[pollId]', pl: '/glosuj/[pollId]'}`

4.  **Update Middleware (`src/middleware.ts`)**:
    *   Add the new language code to the `matcher` regular expression. This allows the app to recognize URLs with the new language prefix (e.g., `/pl/...`).
    *   `'/(de|en|fr|es|it|nl|no|sv|da|fi|pl)/:path*'`

5.  **Update the Language Switcher Component (`src/components/common/LanguageSwitcher.tsx`)**:
    *   Add a new `<SelectItem>` to the dropdown menu so users can choose the new language.
    *   `<SelectItem value="pl">Polski</SelectItem>`

---

## Self-Hosting on a Linux Server

To deploy and run this project on your own Linux server, follow these steps. This guide assumes you are using a system with `systemd`, which is common for modern distributions like Ubuntu, Debian, or CentOS.

### 1. Prerequisites

*   **Node.js**: Ensure you have Node.js (version 18.x or higher) and `npm` installed.
*   **Git**: To clone the project from your repository.

### 2. Setup

1.  **Clone Your Project**
    ```bash
    # Replace the URL with your own repository URL
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Create Environment File**
    Create a `.env.local` file in the root of your project. This file stores your secret keys and configuration.
    ```bash
    touch .env.local
    ```
    Open the file and add the following variables, replacing the placeholder values with your actual Mealie API details:
    ```
    # Your Mealie instance URL
    MEALIE_API_URL=http://your-mealie-domain.com
    # Your long-lived Mealie API token
    MEALIE_API_TOKEN=ey...
    # The default language for the app (e.g., fr, en, de)
    DEFAULT_LOCALE=en
    ```

### 3. Build and Run

1.  **Build the Application**
    This command compiles the Next.js application for production.
    ```bash
    npm run build
    ```

2.  **Run the Application**
    This command starts the production server, which typically runs on port 3000.
    ```bash
    npm start
    ```
    You can verify it's running by visiting `http://<your_server_ip>:3000`.

### 4. Automatic Start on Reboot (using `systemd`)

To ensure your application automatically starts when your server reboots, you can create a `systemd` service.

1.  **Create a Service File**
    Create a new service file using a text editor like `nano`:
    ```bash
    sudo nano /etc/systemd/system/mealvote.service
    ```

2.  **Add Service Configuration**
    Paste the following configuration into the file. **Make sure to replace `/path/to/your/project` with the actual absolute path to your project directory, and `your_user` with your Linux username.**

    ```ini
    [Unit]
    Description=MealVote Next.js Application
    After=network.target

    [Service]
    User=your_user
    Group=your_user
    WorkingDirectory=/path/to/your/project
    ExecStart=/usr/bin/npm start
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```
    Save and close the file (in `nano`, press `Ctrl+X`, then `Y`, then `Enter`).

3.  **Enable and Start the Service**
    *   Reload the `systemd` daemon to recognize the new service:
        ```bash
        sudo systemctl daemon-reload
        ```
    *   Enable the service to start on boot:
        ```bash
        sudo systemctl enable mealvote.service
        ```
    *   Start the service immediately:
        ```bash
        sudo systemctl start mealvote.service
        ```

4.  **Check the Status**
    You can check if the service is running correctly with:
    ```bash
    sudo systemctl status mealvote.service
    ```

Your MealVote application is now running as a service and will automatically restart if the server reboots. If you want to see the application logs, you can use `journalctl -u mealvote.service -f`.
