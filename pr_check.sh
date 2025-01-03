# bin/bash

# run UI with changes
cd konflux-ui
# yarn install
# # start the UI from the PR check in background, save logs to file
# yarn start > logfile 2>&1 &

set -x
echo $TARGET_BRANCH
echo $PR_NUMBER

# run tests
TEST_IMAGE="quay.io/konflux_ui_qe/konflux-ui-tests:latest"

git remote -v

# Rebuild test image if Containerfile from e2e-tests was changed 
if ! git diff --exit-code --quiet origin/${TARGET_BRANCH} HEAD -- e2e-tests/Containerfile; then
echo "Containerfile changes detected, rebuilding test image"
TEST_IMAGE="konflux-ui-tests:pr-$PR_NUMBER"

cd e2e-tests
podman build -t "$TEST_IMAGE" . -f Containerfile
cd ..
fi

echo "running tests using image ${TEST_IMAGE}"

# kill the background process running UI
kill $YARN_PID
