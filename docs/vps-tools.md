# VPS Tools

## Prisma Studio (database browser)

1. Open an SSH tunnel to postgres:

```bash
ssh -L 5432:localhost:5432 deploy@<VPS_IP>
```

2. In another terminal, from the project root:

```bash
DATABASE_URL="postgresql://moodpulse:<password>@localhost:5432/moodpulse" bunx --bun prisma studio
```

3. Opens in browser at `http://localhost:5555`

## Dozzle (log viewer)

1. Open an SSH tunnel:

```bash
ssh -L 8080:localhost:8080 deploy@<VPS_IP>
```

2. Open `http://localhost:8080` in browser

## psql (quick SQL queries)

```bash
ssh deploy@<VPS_IP>
cd /opt/moodpulse && docker compose exec postgres psql -U moodpulse moodpulse
```

## Logs via CLI

```bash
ssh deploy@<VPS_IP>
cd /opt/moodpulse
docker compose logs -f bot          # realtime
docker compose logs --tail 100 bot  # last 100 lines
docker compose logs --since 1h bot  # last hour
```
