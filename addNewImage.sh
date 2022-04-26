#!/bin/bash

BRANCH=main
GIT_URL=github.com/leighawilliamson/sai-image-server.git
LOCAL_GIT_REPO=/Users/leighw/git/sai-image-server
NEW_IMAGE=$1
IMAGE_PROJECT=$2
USERNAME=leighw
PAT=JYZpyhCYowd2zVDjoYrK
IMAGE_SERVER_URL=https://imageserver.n8eu78rs3sm.us-south.codeengine.appdomain.cloud

echo
echo "Updating image-server project: $IMAGE_PROJECT with image file: $NEW_IMAGE..."
if [ ! -d "$LOCAL_GIT_REPO/public/img/$IMAGE_PROJECT" ]; then
  mkdir -p "$LOCAL_GIT_REPO/public/img/$IMAGE_PROJECT"
fi
cp -R "$NEW_IMAGE" "$LOCAL_GIT_REPO/public/img/$IMAGE_PROJECT"
echo "File copied into git repo."
cd $LOCAL_GIT_REPO
echo "GIT STATUS before adding:"
git status -s -b
echo
git add public/
echo "GIT STATUS after adding:"
git status -s -b
echo
git commit --quiet -m "Commiting new image: ${IMAGE_PROJECT}/${NEW_IMAGE}"
git push --quiet https://$USERNAME:$PAT@$GIT_URL $BRANCH
echo
echo "GIT STATUS after commit/push:"
git status -s -b
echo
echo "Once image-server finishes redeploying, access this new image at:"
echo "$IMAGE_SERVER_URL/img/${IMAGE_PROJECT}/${NEW_IMAGE}"