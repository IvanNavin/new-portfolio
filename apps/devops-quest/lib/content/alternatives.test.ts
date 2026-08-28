import { describe, expect, it } from 'vitest';

import { getMission } from '../content/registry';
import { runLine } from '../shell/run';

/** Different, but equally correct, ways a competent person would do it. */
const ALTS: Record<string, string[]> = {
  'l01-m01': ['pwd', 'cd /var/log', 'cd app', 'ls -l'],
  'l01-m02': ['ls -a', 'cat ~/.app.conf', 'echo "production" > ~/answer.txt'],
  'l01-m03': [
    'ls -la /tmp',
    'mkdir -p /srv/app/releases /srv/app/shared/logs',
    'mv /tmp/app-v2.4.1.tar.gz /srv/app/releases',
    'ls /srv/app/releases',
  ],
  'l01-m04': [
    'cat app.log | grep ERROR > /home/deploy/errors.txt',
    'cat app.log | grep -c ERROR > /home/deploy/error-count.txt',
    'cat /home/deploy/errors.txt',
  ],
  'l01-m05': [
    'find /etc -name "*.conf"',
    'grep -rn "debug=true" /etc',
    'echo "/etc/app/worker/queue.conf" > /home/deploy/found.txt',
  ],
  'l02-m02': ['chmod a+x deploy.sh', 'chmod g+r,o+r app.conf', 'ls -la'],
  'l02-m03': [
    'chmod u=rw,go= /srv/app/.env',
    'chmod u=rw,go= /srv/app/secrets/api.key',
    'chmod u=rwx,go= /srv/app/secrets',
    'ls -l /srv/app',
  ],
  'l02-m05': [
    'ls -la /srv/shop',
    'sudo chown -R app:app /srv/shop/',
    'sudo chmod u+rwx,go+rx /srv/shop/logs',
    'ls -l /srv/shop',
  ],
  'l03-m01': ['top', 'kill -TERM 1421', 'ps aux'],
  'l03-m02': [
    'systemctl status nginx',
    'sudo systemctl start nginx',
    'sudo systemctl enable nginx',
    'netstat -tulpn',
  ],
  'l03-m03': [
    'journalctl -u nginx -n 50',
    'ss -tlnp',
    'ps aux',
    'echo 2201 > /home/deploy/culprit.txt',
    'sudo kill -9 2201',
    'sudo systemctl restart nginx',
    'systemctl status nginx',
  ],
  'l04-m01': ['ip a', 'ss -ltnp', 'echo "5432" > /home/deploy/exposed.txt'],
  'l04-m02': [
    'dig +short api.internal CNAME',
    'dig +short shop-old.internal A',
    'echo 10.0.0.99 > /home/deploy/dns.txt',
  ],
  'l04-m03': [
    'curl -I http://shop.internal',
    'curl https://shop.internal/api/health',
    'echo "502" > /home/deploy/status.txt',
    'echo "backend" > /home/deploy/diagnosis.txt',
  ],
  'l05-m01': [
    'ssh-keygen -t ed25519 -f /home/deploy/.ssh/id_ed25519 -C "x"',
    'ls -la ~/.ssh',
  ],
  'l05-m02': [
    'ssh deploy@app-01',
    'chmod u=rw,go= ~/.ssh/id_ed25519',
    'chmod u=rwx,go= ~/.ssh',
    'ssh deploy@app-01',
  ],
  'l06-m01': [
    'git init',
    'git status',
    'git add server.js package.json',
    'git commit -m "init"',
    'git log',
  ],
  'l06-m03': [
    'git checkout -b feature/health',
    'touch health.js',
    'git add .',
    'git commit -m "x"',
    'git checkout main',
    'git merge feature/health',
  ],
  'l06-m05': ['git log', 'git revert 5157ead', 'cat app.conf', 'git push'],
  'l07-m01': [
    'docker ps',
    'sudo usermod -a -G docker deploy',
    'docker pull nginx:alpine',
    'docker run --name web -d nginx:alpine',
    'docker ps -a',
  ],
  'l07-m03': [
    'docker build -t shop-api:1.0 .',
    'docker run --name api -d -p 8080:3000 shop-api:1.0',
    'docker ps',
    'curl http://localhost:8080',
  ],
  'l09-m03': [
    'chmod u=rw,go= .env',
    'ls -l',
    'export APP_ENV="production"',
    'echo $APP_ENV',
  ],
  'l10-m02': [
    'df',
    'du -sh /var/log/*',
    'cat /dev/null > /var/log/app/debug.log',
    'ls -l /var/log/app',
  ],
  'l11-m03': [
    'kubectl apply -f k8s/deployment.yaml',
    'kubectl scale --replicas=5 deployment/shop-api',
    'kubectl get pods',
    'kubectl rollout status deploy/shop-api',
  ],
  'l02-m01': [
    'id -a',
    'less /etc/passwd',
    'sudo cat /root/.secret-plan',
    'horih2031',
  ],
  'l02-m04': [
    'sudo groupadd deployers',
    'sudo useradd --create-home --shell /bin/bash ci',
    'sudo usermod -aG docker ci',
    'sudo usermod -aG deployers ci',
    'groups ci',
  ],
  'l04-m04': [
    'sudo ufw allow 22',
    'sudo ufw allow 443',
    'sudo ufw deny 9100',
    'sudo ufw enable',
    'sudo ufw status verbose',
  ],
  'l05-m03': [
    'ssh-copy-id -i /tmp/ci_key.pub deploy@app-01',
    'cat ~/.ssh/authorized_keys',
  ],
  'l06-m02': [
    'git init',
    'printf ".env\\n*.log\\n" > .gitignore',
    'git add -A',
    'git commit -m "x"',
    'git status',
  ],
  'l06-m04': [
    'git status',
    'cat VERSION',
    'printf "version=2.0.0\\n" > VERSION',
    'git add .',
    'git commit -m "merge"',
  ],
  'l07-m05': ['cat docker-compose.yml', 'docker compose up -d', 'docker ps'],
  'l08-m04': [
    'docker image ls',
    'docker stop api',
    'docker rm api',
    'docker run -d -p 8080:3000 --name api shop-api:1.0.0',
    'docker ps',
  ],
  'l08-m05': [
    'tail -n 30 build.log',
    'grep -i fail build.log',
    'echo npm test > ~/stage.txt',
    'echo src/checkout.test.ts > ~/failing.txt',
  ],
  'l09-m01': [
    'sudo nginx -t',
    'echo "6" > ~/broken-line.txt',
    'sudo cp /etc/nginx/nginx.conf.bak /etc/nginx/nginx.conf',
    'sudo nginx -t',
    'sudo systemctl restart nginx',
    'systemctl status nginx',
  ],
  'l09-m04': [
    'sudo certbot --nginx -d shop.internal',
    'ls -l /etc/letsencrypt/live/shop.internal',
    'sudo nginx -t',
    'sudo nginx -s reload',
  ],
  'l10-m01': [
    'grep -c " 502 " access.log',
    'grep " 502 " access.log | wc -l > ~/count-502.txt',
    'echo "/checkout" > ~/endpoint.txt',
  ],
  'l10-m03': [
    'curl -I https://shop.internal/api/health',
    'systemctl status shop-api',
    'journalctl -u shop-api',
    'echo "database" > ~/cause.txt',
    'sudo systemctl restart shop-api',
    'systemctl status shop-api',
  ],
  'l11-m01': [
    'kubectl get po',
    'kubectl describe pod shop-api-7d4f9c-ghi56',
    'kubectl logs shop-api-7d4f9c-ghi56',
    'echo "DATABASE_URL" > ~/missing.txt',
  ],
  'l11-m04': [
    'kubectl get pods',
    'kubectl logs shop-api-9b1e-aa11',
    'kubectl rollout history deploy/shop-api',
    'kubectl rollout undo deploy/shop-api',
    'kubectl get pods',
  ],
  'l12-m01': [
    'terraform init',
    'terraform plan',
    'terraform apply',
    'terraform state list',
  ],
  'l12-m04': [
    'git add -A',
    'git commit -m "fix"',
    'git tag v1.6.0',
    'docker build -t shop-api:1.6.0 .',
    'kubectl apply -f k8s/deployment.yaml',
    'kubectl get pods',
    'echo "v1.6.0" > ~/release.txt',
  ],
};

/**
 * Doing it right a different way must also count.
 *
 * Every other test here replays the mission's own printed solution, so a goal
 * that quietly demands one exact spelling passes them all and still blocks a
 * player who knows what they are doing. These are the same missions solved the
 * way a competent person might reach for instead: symbolic chmod, `git switch`
 * territory, `docker image ls`, `netstat` for `ss`, `restart` for `start`,
 * long flags for short ones.
 *
 * It found `git add -A` answering «Nothing specified, nothing added», the ssh
 * mission grading on the literal text «chmod 700», and `docker image ls` not
 * counting as looking at images.
 */
describe('alternative solutions are accepted', () => {
  it.each(Object.entries(ALTS))(
    '%s accepts a different correct route',
    (id, lines) => {
      const rows: string[] = [];
      const mission = getMission(id);
      if (!mission || mission.task.kind !== 'terminal')
        throw new Error(`${id} is not a terminal mission`);
      let state = mission.task.boot();
      for (const line of lines) state = runLine(state, line).state;
      const unmet = mission.task.goals
        .filter((goal) => !goal.check(state))
        .map((goal) => goal.id);
      expect(unmet, `${id} blocks a correct alternative`).toEqual([]);
      expect(rows).toEqual([]);
    },
  );
});
