cd backend
echo "running backend service -> "
pnpm run dev &

cd ..
cd frontend
echo "running backend services -> "
pnpm run dev &

